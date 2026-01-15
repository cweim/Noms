"""
Google Places API service module
Wraps googlemaps library for place search, details, and photos
"""

import os
from typing import Optional
import googlemaps
from googlemaps.exceptions import ApiError, HTTPError, Timeout, TransportError
from dotenv import load_dotenv

from app.errors import DatabaseError, ValidationError

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

            return response.get("results", [])

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

        Args:
            google_place_id: Google Place ID (e.g., "ChIJ...")

        Returns:
            Place details dict or None if not found
        """
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

            return response.get("result")

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
