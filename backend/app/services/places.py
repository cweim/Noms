"""
Google Places API service module
Wraps googlemaps library for place search, details, and photos
Implements caching to reduce API costs
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import googlemaps
from googlemaps.exceptions import ApiError, HTTPError, Timeout, TransportError
from dotenv import load_dotenv

from app.db import get_supabase
from app.errors import DatabaseError, ValidationError

# Cache staleness threshold
CACHE_DAYS = 7

load_dotenv()

# Singleton instance
_places_service: Optional["GooglePlacesService"] = None


class GooglePlacesService:
    """
    Service for interacting with Google Places API.
    Provides search, details, and photo retrieval functionality.
    """

    def __init__(self):
        api_key = os.getenv("GOOGLE_PLACES_API_KEY")
        if not api_key:
            raise ValidationError(
                message="Google Places API key not configured",
                detail={"env_var": "GOOGLE_PLACES_API_KEY"}
            )
        self.client = googlemaps.Client(key=api_key)

    def _is_cache_stale(self, last_fetched_at: Optional[str]) -> bool:
        """
        Check if cached data is stale.

        Args:
            last_fetched_at: ISO timestamp string from database

        Returns:
            True if cache is stale or doesn't exist
        """
        if not last_fetched_at:
            return True

        try:
            # Parse ISO timestamp from database
            fetched_time = datetime.fromisoformat(
                last_fetched_at.replace("Z", "+00:00")
            )
            stale_threshold = datetime.now(timezone.utc) - timedelta(days=CACHE_DAYS)
            return fetched_time < stale_threshold
        except (ValueError, AttributeError):
            return True

    def _cache_place(self, place_data: dict) -> Optional[str]:
        """
        Cache place data to database using upsert.

        Args:
            place_data: Place data from Google Places API

        Returns:
            Internal UUID of cached place or None if caching failed
        """
        try:
            supabase = get_supabase()

            # Extract fields from API response
            google_place_id = place_data.get("place_id")
            if not google_place_id:
                return None

            # Get address from either field
            address = place_data.get("vicinity") or place_data.get("formatted_address")

            # Get first photo reference if available
            photos = place_data.get("photos", [])
            photo_reference = photos[0].get("photo_reference") if photos else None

            # Prepare data for upsert
            cache_data = {
                "google_place_id": google_place_id,
                "name": place_data.get("name"),
                "address": address,
                "photo_reference": photo_reference,
                "types": place_data.get("types", []),
                "last_fetched_at": datetime.now(timezone.utc).isoformat()
            }

            # Upsert with conflict on google_place_id
            result = supabase.table("places").upsert(
                cache_data,
                on_conflict="google_place_id"
            ).execute()

            if result.data:
                return result.data[0].get("id")
            return None

        except Exception:
            # Caching failure shouldn't break the API response
            return None

    def _get_cached_place(self, google_place_id: str) -> Optional[dict]:
        """
        Get place from cache if fresh.

        Args:
            google_place_id: Google Place ID

        Returns:
            Cached place dict with internal id, or None if not cached/stale
        """
        try:
            supabase = get_supabase()
            result = supabase.table("places").select("*").eq(
                "google_place_id", google_place_id
            ).execute()

            if not result.data:
                return None

            place = result.data[0]

            # Check if cache is stale
            if self._is_cache_stale(place.get("last_fetched_at")):
                return None

            return place

        except Exception:
            return None

    def search_places(
        self,
        query: str,
        lat: float,
        lng: float,
        radius: int = 1000
    ) -> list[dict]:
        """
        Search for places near a location.

        Args:
            query: Search query (e.g., "pizza", "sushi restaurant")
            lat: Latitude of search center
            lng: Longitude of search center
            radius: Search radius in meters (default 1000)

        Returns:
            List of place results from Google Places API
        """
        try:
            response = self.client.places(
                query=query,
                location=(lat, lng),
                radius=radius,
                type="restaurant"
            )

            status = response.get("status", "UNKNOWN")

            if status == "ZERO_RESULTS":
                return []
            elif status == "OVER_QUERY_LIMIT":
                raise DatabaseError(
                    message="Rate limited by Google Places API",
                    detail={"status": status}
                )
            elif status == "REQUEST_DENIED":
                raise ValidationError(
                    message="Invalid API key or API not enabled",
                    detail={"status": status}
                )
            elif status not in ("OK", "ZERO_RESULTS"):
                raise DatabaseError(
                    message=f"Google Places API error: {status}",
                    detail={"status": status}
                )

            results = response.get("results", [])

            # Cache each result and add internal UUID
            for place in results:
                cached_id = self._cache_place(place)
                if cached_id:
                    place["cached_id"] = cached_id

            return results

        except ApiError as e:
            raise DatabaseError(
                message="Google Places API error",
                detail={"error": str(e)}
            )
        except (HTTPError, Timeout, TransportError) as e:
            raise DatabaseError(
                message="Network error contacting Google Places API",
                detail={"error": str(e)}
            )

    def get_place_details(self, google_place_id: str) -> Optional[dict]:
        """
        Get detailed information about a place.
        Checks cache first, fetches from API if stale or not cached.

        Args:
            google_place_id: Google Place ID (e.g., "ChIJ...")

        Returns:
            Place details dict or None if not found
        """
        # Check cache first
        cached = self._get_cached_place(google_place_id)
        if cached:
            # Return cached data in API-compatible format
            return {
                "place_id": cached["google_place_id"],
                "cached_id": cached["id"],
                "name": cached["name"],
                "formatted_address": cached["address"],
                "photos": [{"photo_reference": cached["photo_reference"]}] if cached.get("photo_reference") else [],
                "types": cached.get("types", []),
                "_from_cache": True
            }

        # Fetch from API
        try:
            response = self.client.place(
                place_id=google_place_id,
                fields=[
                    "place_id",
                    "name",
                    "formatted_address",
                    "geometry",
                    "photos",
                    "types",
                    "rating",
                    "price_level",
                    "opening_hours",
                    "website",
                    "formatted_phone_number"
                ]
            )

            status = response.get("status", "UNKNOWN")

            if status == "NOT_FOUND" or status == "ZERO_RESULTS":
                return None
            elif status == "OVER_QUERY_LIMIT":
                raise DatabaseError(
                    message="Rate limited by Google Places API",
                    detail={"status": status}
                )
            elif status == "REQUEST_DENIED":
                raise ValidationError(
                    message="Invalid API key or API not enabled",
                    detail={"status": status}
                )
            elif status not in ("OK",):
                raise DatabaseError(
                    message=f"Google Places API error: {status}",
                    detail={"status": status}
                )

            result = response.get("result")

            # Cache the result
            if result:
                cached_id = self._cache_place(result)
                if cached_id:
                    result["cached_id"] = cached_id

            return result

        except ApiError as e:
            raise DatabaseError(
                message="Google Places API error",
                detail={"error": str(e)}
            )
        except (HTTPError, Timeout, TransportError) as e:
            raise DatabaseError(
                message="Network error contacting Google Places API",
                detail={"error": str(e)}
            )

    def get_place_photo(
        self,
        photo_reference: str,
        max_width: int = 400
    ) -> Optional[bytes]:
        """
        Get a photo for a place.

        Args:
            photo_reference: Photo reference from place result
            max_width: Maximum width of returned image (default 400)

        Returns:
            Photo bytes or None if not found
        """
        try:
            # places_photo returns a generator of image chunks
            photo_data = self.client.places_photo(
                photo_reference=photo_reference,
                max_width=max_width
            )

            # Collect all chunks into bytes
            return b"".join(photo_data)

        except ApiError as e:
            if "INVALID_REQUEST" in str(e):
                return None
            raise DatabaseError(
                message="Google Places API error fetching photo",
                detail={"error": str(e)}
            )
        except (HTTPError, Timeout, TransportError) as e:
            raise DatabaseError(
                message="Network error fetching photo",
                detail={"error": str(e)}
            )


def get_places_service() -> GooglePlacesService:
    """
    Get singleton instance of GooglePlacesService.
    Creates instance on first call.
    """
    global _places_service
    if _places_service is None:
        _places_service = GooglePlacesService()
    return _places_service
