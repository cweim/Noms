"""
Places router for Google Places API endpoints
"""

from fastapi import APIRouter, Depends, Query
from app.services.places import get_places_service
from app.schemas.places import PlaceResult, PlaceSearchResponse
from app.auth import get_current_user

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
