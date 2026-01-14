"""
Custom exceptions and error response models for the Noms API
Provides consistent error handling across all endpoints
"""

from typing import Optional
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response format for all API errors"""

    error: str
    message: str
    detail: Optional[dict] = None


class DatabaseError(Exception):
    """Raised when database operations fail"""

    def __init__(self, message: str, detail: Optional[dict] = None):
        self.message = message
        self.detail = detail
        super().__init__(message)


class AuthenticationError(Exception):
    """Raised when authentication fails or is required"""

    def __init__(self, message: str, detail: Optional[dict] = None):
        self.message = message
        self.detail = detail
        super().__init__(message)


class NotFoundError(Exception):
    """Raised when a requested resource is not found"""

    def __init__(self, message: str, detail: Optional[dict] = None):
        self.message = message
        self.detail = detail
        super().__init__(message)


class ValidationError(Exception):
    """Raised when request validation fails"""

    def __init__(self, message: str, detail: Optional[dict] = None):
        self.message = message
        self.detail = detail
        super().__init__(message)
