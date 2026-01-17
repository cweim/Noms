"""Pydantic schemas for saved places endpoints"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SavePlaceRequest(BaseModel):
    """Request to save a place"""
    google_place_id: str
    list_id: Optional[str] = None  # NULL = default "Saved" list


class SavedPlace(BaseModel):
    """A saved place with place details"""
    id: str  # saved_places.id
    place_id: str  # places.id (internal UUID)
    google_place_id: str
    name: str
    address: Optional[str] = None
    photo_reference: Optional[str] = None
    saved_at: datetime
    list_id: Optional[str] = None


class SavedPlacesResponse(BaseModel):
    """Response with list of saved places"""
    places: list[SavedPlace]
    count: int
