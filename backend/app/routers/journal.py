"""
Journal router - endpoints for food journal entries
All endpoints require JWT authentication
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.db import get_supabase
from app.errors import NotFoundError
from app.schemas.journal import (
    CreateJournalEntryRequest,
    JournalEntry,
    JournalEntriesResponse,
    UpdateJournalEntryRequest,
)

router = APIRouter()


@router.post("/", response_model=JournalEntry, status_code=201)
async def create_journal_entry(
    request: CreateJournalEntryRequest,
    user: dict = Depends(get_current_user)
):
    """
    Create a new journal entry.

    Photo URL should be a Supabase storage URL.
    Place association is optional - can log food without linking to a restaurant.
    """
    user_id = user["sub"]
    supabase = get_supabase()

    # Resolve place_id from google_place_id if provided
    place_id = None
    place_name = None
    if request.google_place_id:
        place_result = supabase.table("places").select("id, name").eq(
            "google_place_id", request.google_place_id
        ).execute()
        if place_result.data:
            place_id = place_result.data[0]["id"]
            place_name = place_result.data[0]["name"]

    # Create entry
    entry_data = {
        "user_id": user_id,
        "photo_url": request.photo_url,
        "place_id": place_id,
        "rating": request.rating,
        "note": request.note,
        "eaten_at": (request.eaten_at or datetime.now(timezone.utc)).isoformat(),
    }

    result = supabase.table("journal_entries").insert(entry_data).execute()
    entry = result.data[0]

    return JournalEntry(
        id=entry["id"],
        photo_url=entry["photo_url"],
        place_id=place_id,
        google_place_id=request.google_place_id,
        place_name=place_name,
        rating=entry["rating"],
        note=entry["note"],
        eaten_at=entry["eaten_at"],
        created_at=entry["created_at"],
    )


@router.get("/", response_model=JournalEntriesResponse)
async def get_journal_entries(
    user: dict = Depends(get_current_user)
):
    """
    Get all journal entries for current user.

    Ordered by eaten_at descending (most recent first).
    Includes place details if linked.
    """
    user_id = user["sub"]
    supabase = get_supabase()

    result = supabase.table("journal_entries").select(
        "id, photo_url, rating, note, eaten_at, created_at, place_id, places(id, google_place_id, name)"
    ).eq("user_id", user_id).order("eaten_at", desc=True).execute()

    entries = []
    for row in result.data:
        place_data = row.get("places")
        entries.append(JournalEntry(
            id=row["id"],
            photo_url=row["photo_url"],
            place_id=row["place_id"],
            google_place_id=place_data["google_place_id"] if place_data else None,
            place_name=place_data["name"] if place_data else None,
            rating=row["rating"],
            note=row["note"],
            eaten_at=row["eaten_at"],
            created_at=row["created_at"],
        ))

    return JournalEntriesResponse(entries=entries, count=len(entries))


@router.get("/{entry_id}", response_model=JournalEntry)
async def get_journal_entry(
    entry_id: str,
    user: dict = Depends(get_current_user)
):
    """Get a single journal entry by ID."""
    user_id = user["sub"]
    supabase = get_supabase()

    result = supabase.table("journal_entries").select(
        "id, photo_url, rating, note, eaten_at, created_at, place_id, places(id, google_place_id, name)"
    ).eq("id", entry_id).eq("user_id", user_id).execute()

    if not result.data:
        raise NotFoundError(
            message="Journal entry not found",
            detail={"entry_id": entry_id}
        )

    row = result.data[0]
    place_data = row.get("places")

    return JournalEntry(
        id=row["id"],
        photo_url=row["photo_url"],
        place_id=row["place_id"],
        google_place_id=place_data["google_place_id"] if place_data else None,
        place_name=place_data["name"] if place_data else None,
        rating=row["rating"],
        note=row["note"],
        eaten_at=row["eaten_at"],
        created_at=row["created_at"],
    )


@router.patch("/{entry_id}", response_model=JournalEntry)
async def update_journal_entry(
    entry_id: str,
    request: UpdateJournalEntryRequest,
    user: dict = Depends(get_current_user)
):
    """
    Update a journal entry's rating or note.

    Only the owner can update their entries.
    """
    user_id = user["sub"]
    supabase = get_supabase()

    # Build update data (only include non-None fields)
    update_data = {}
    if request.rating is not None:
        update_data["rating"] = request.rating
    if request.note is not None:
        update_data["note"] = request.note

    if not update_data:
        # Nothing to update, just return current entry
        return await get_journal_entry(entry_id, user)

    result = supabase.table("journal_entries").update(update_data).eq(
        "id", entry_id
    ).eq("user_id", user_id).execute()

    if not result.data:
        raise NotFoundError(
            message="Journal entry not found",
            detail={"entry_id": entry_id}
        )

    # Fetch full entry with place data
    return await get_journal_entry(entry_id, user)


@router.delete("/{entry_id}", status_code=204)
async def delete_journal_entry(
    entry_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a journal entry.

    Only the owner can delete their entries.
    """
    user_id = user["sub"]
    supabase = get_supabase()

    result = supabase.table("journal_entries").delete().eq(
        "id", entry_id
    ).eq("user_id", user_id).execute()

    if not result.data:
        raise NotFoundError(
            message="Journal entry not found",
            detail={"entry_id": entry_id}
        )

    return None
