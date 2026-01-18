"""Pydantic schemas for journal entries"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CreateJournalEntryRequest(BaseModel):
    """Request body for creating a journal entry"""
    photo_url: str = Field(..., min_length=1)
    google_place_id: Optional[str] = None  # Optional place association
    rating: Optional[int] = Field(None, ge=1, le=5)
    note: Optional[str] = None
    eaten_at: Optional[datetime] = None  # Defaults to now on server


class JournalEntry(BaseModel):
    """Journal entry response model"""
    id: str
    photo_url: str
    place_id: Optional[str] = None
    google_place_id: Optional[str] = None
    place_name: Optional[str] = None
    rating: Optional[int] = None
    note: Optional[str] = None
    eaten_at: datetime
    created_at: datetime


class JournalEntriesResponse(BaseModel):
    """Response for listing journal entries"""
    entries: list[JournalEntry]
    count: int


class UpdateJournalEntryRequest(BaseModel):
    """Request body for updating a journal entry"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    note: Optional[str] = None
