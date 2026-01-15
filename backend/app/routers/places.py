"""
Places router for Google Places API endpoints
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
import io

from app.services.places import get_places_service
from app.schemas.places import PlaceResult, PlaceSearchResponse, PlaceDetailResponse
from app.auth import get_current_user
from app.db import get_supabase
from app.errors import NotFoundError

router = APIRouter()


@router.get("/search", response_model=PlaceSearchResponse)
async def search_places(
    q: str = Query(..., min_length=1, description="Search query"),
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius: int = Query(default=1000, ge=100, le=50000),
    user: dict = Depends(get_current_user)
):
    """
    Search for places near a location.

    Requires authentication.
    Results are cached to reduce API costs.
    """
    service = get_places_service()
    results = service.search_places(
        query=q,
        lat=lat,
        lng=lng,
        radius=radius
    )

    # Map API results to response schema
    places = [
        PlaceResult(
            id=r.get("cached_id"),
            google_place_id=r["place_id"],
            name=r["name"],
            address=r.get("vicinity") or r.get("formatted_address"),
            location={"lat": r["geometry"]["location"]["lat"], "lng": r["geometry"]["location"]["lng"]} if "geometry" in r else None,
            photo_reference=r["photos"][0]["photo_reference"] if r.get("photos") else None,
            types=r.get("types", []),
            rating=r.get("rating"),
            price_level=r.get("price_level"),
            open_now=r.get("opening_hours", {}).get("open_now")
        )
        for r in results
    ]

    return PlaceSearchResponse(places=places, count=len(places))


@router.get("/{place_id}", response_model=PlaceDetailResponse)
async def get_place_details(
    place_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a place.

    place_id can be either:
    - Google Place ID (starts with "ChIJ...")
    - Internal UUID from our cache

    Requires authentication.
    """
    service = get_places_service()

    # Check if it's a Google place_id or internal UUID
    if place_id.startswith("ChIJ"):
        google_place_id = place_id
    else:
        # Look up Google place_id from our cache by internal UUID
        supabase = get_supabase()
        result = supabase.table("places").select("google_place_id").eq("id", place_id).execute()
        if not result.data:
            raise NotFoundError(message="Place not found", detail={"place_id": place_id})
        google_place_id = result.data[0]["google_place_id"]

    # Get details (uses cache if fresh)
    details = service.get_place_details(google_place_id)
    if not details:
        raise NotFoundError(message="Place not found", detail={"google_place_id": google_place_id})

    return PlaceDetailResponse(
        id=details.get("cached_id"),
        google_place_id=details.get("place_id") or google_place_id,
        name=details["name"],
        address=details.get("formatted_address"),
        location={"lat": details["geometry"]["location"]["lat"], "lng": details["geometry"]["location"]["lng"]} if "geometry" in details else None,
        photo_reference=details.get("photos", [{}])[0].get("photo_reference") if details.get("photos") else None,
        types=details.get("types", []),
        rating=details.get("rating"),
        price_level=details.get("price_level"),
        open_now=details.get("opening_hours", {}).get("open_now"),
        website=details.get("website"),
        phone_number=details.get("formatted_phone_number"),
        hours=details.get("opening_hours", {}).get("weekday_text")
    )


@router.get("/{place_id}/photo")
async def get_place_photo(
    place_id: str,
    max_width: int = Query(default=400, ge=100, le=1600),
    user: dict = Depends(get_current_user)
):
    """
    Get a photo for a place.

    Returns the image directly (not JSON).
    Mobile client can use this URL as image source.

    Requires authentication.
    """
    service = get_places_service()
    supabase = get_supabase()

    # Get photo_reference from cache
    if place_id.startswith("ChIJ"):
        # Look up by Google place_id
        result = supabase.table("places").select("photo_reference").eq("google_place_id", place_id).execute()
    else:
        # Look up by internal UUID
        result = supabase.table("places").select("photo_reference").eq("id", place_id).execute()

    if not result.data or not result.data[0].get("photo_reference"):
        raise NotFoundError(
            message="Photo not found",
            detail={"place_id": place_id, "hint": "Place may not have a photo"}
        )

    photo_reference = result.data[0]["photo_reference"]

    # Fetch photo from Google
    photo_data = service.get_place_photo(photo_reference, max_width=max_width)
    if not photo_data:
        raise NotFoundError(message="Failed to fetch photo")

    # Return image as streaming response
    return StreamingResponse(
        io.BytesIO(photo_data),
        media_type="image/jpeg"
    )
