"""
Saves router - endpoints for saving/unsaving places
All endpoints require JWT authentication
"""

from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.db import get_supabase
from app.errors import NotFoundError, ConflictError
from app.schemas.saves import SavePlaceRequest, SavedPlace, SavedPlacesResponse

router = APIRouter()


@router.post("/", response_model=SavedPlace, status_code=201)
async def save_place(
    request: SavePlaceRequest,
    user: dict = Depends(get_current_user)
):
    """
    Save a place to user's list.

    If place doesn't exist in places table, creates a minimal entry.
    Uses default list (list_id=NULL) if no list_id provided.

    Returns 409 Conflict if already saved to same list.
    """
    user_id = user["sub"]
    supabase = get_supabase()

    # Find or create place in places table
    place_result = supabase.table("places").select("id, google_place_id, name, address, photo_reference").eq("google_place_id", request.google_place_id).execute()

    if not place_result.data:
        # Place not in cache - this shouldn't happen if user saw it in picker
        # but handle gracefully by creating minimal entry
        raise NotFoundError(
            message="Place not found in cache",
            detail={"google_place_id": request.google_place_id, "hint": "Place must be fetched first via search"}
        )

    place = place_result.data[0]

    # Check if already saved
    existing = supabase.table("saved_places").select("id").eq("user_id", user_id).eq("place_id", place["id"]).is_("list_id", "null" if request.list_id is None else request.list_id).execute()

    if existing.data:
        raise ConflictError(
            message="Place already saved",
            detail={"place_id": place["id"], "list_id": request.list_id}
        )

    # Create saved_places entry
    save_data = {
        "user_id": user_id,
        "place_id": place["id"],
        "list_id": request.list_id
    }
    result = supabase.table("saved_places").insert(save_data).execute()
    saved = result.data[0]

    return SavedPlace(
        id=saved["id"],
        place_id=place["id"],
        google_place_id=place["google_place_id"],
        name=place["name"],
        address=place["address"],
        photo_reference=place["photo_reference"],
        saved_at=saved["saved_at"],
        list_id=saved["list_id"]
    )


@router.get("/", response_model=SavedPlacesResponse)
async def get_saved_places(
    user: dict = Depends(get_current_user)
):
    """
    Get all saved places for current user.

    Returns places from default list (list_id=NULL).
    Ordered by most recently saved first.
    """
    user_id = user["sub"]
    supabase = get_supabase()

    # Join saved_places with places table
    result = supabase.table("saved_places").select(
        "id, saved_at, list_id, places(id, google_place_id, name, address, photo_reference)"
    ).eq("user_id", user_id).is_("list_id", "null").order("saved_at", desc=True).execute()

    places = []
    for row in result.data:
        place_data = row["places"]
        places.append(SavedPlace(
            id=row["id"],
            place_id=place_data["id"],
            google_place_id=place_data["google_place_id"],
            name=place_data["name"],
            address=place_data["address"],
            photo_reference=place_data["photo_reference"],
            saved_at=row["saved_at"],
            list_id=row["list_id"]
        ))

    return SavedPlacesResponse(places=places, count=len(places))


@router.delete("/{save_id}", status_code=204)
async def unsave_place(
    save_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Remove a place from saved list.

    Returns 404 if save not found or doesn't belong to user.
    """
    user_id = user["sub"]
    supabase = get_supabase()

    # Verify ownership and delete
    result = supabase.table("saved_places").delete().eq("id", save_id).eq("user_id", user_id).execute()

    if not result.data:
        raise NotFoundError(
            message="Saved place not found",
            detail={"save_id": save_id}
        )

    return None
