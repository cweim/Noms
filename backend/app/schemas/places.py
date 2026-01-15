"""
Pydantic schemas for Places API endpoints
"""

from pydantic import BaseModel, Field
from typing import Optional


class PlaceLocation(BaseModel):
    lat: float
    lng: float


class PlacePhoto(BaseModel):
    photo_reference: str
    height: Optional[int] = None
    width: Optional[int] = None


class PlaceResult(BaseModel):
    """Place data returned from search/details"""
    id: Optional[str] = None  # Internal UUID from cache
    google_place_id: str
    name: str
    address: Optional[str] = None
    location: Optional[PlaceLocation] = None
    photo_reference: Optional[str] = None
    types: list[str] = []
    rating: Optional[float] = None
    price_level: Optional[int] = None
    open_now: Optional[bool] = None


class PlaceSearchRequest(BaseModel):
    """Query parameters for place search"""
    q: str = Field(..., min_length=1, description="Search query")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")
    radius: int = Field(default=1000, ge=100, le=50000, description="Search radius in meters")


class PlaceSearchResponse(BaseModel):
    """Response from place search"""
    places: list[PlaceResult]
    count: int


class PlaceDetailResponse(BaseModel):
    """Extended place data with additional detail fields"""
    id: Optional[str] = None  # Internal UUID from cache
    google_place_id: str
    name: str
    address: Optional[str] = None
    location: Optional[PlaceLocation] = None
    photo_reference: Optional[str] = None
    types: list[str] = []
    rating: Optional[float] = None
    price_level: Optional[int] = None
    open_now: Optional[bool] = None
    # Additional detail fields
    website: Optional[str] = None
    phone_number: Optional[str] = None
    hours: Optional[list[str]] = None  # Opening hours text
