"""
Noms Backend API
FastAPI server for the Noms food discovery app
"""

import logging
import uvicorn
from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.db import get_supabase
from app.errors import (
    DatabaseError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
    ErrorResponse,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Noms API",
    description="Backend API for Noms food discovery app",
    version="0.1.0",
)

# CORS configuration for Expo development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Expo default port
        "http://localhost:19006",  # Expo web
        "http://127.0.0.1:8081",
        "http://127.0.0.1:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers - provide consistent error responses
@app.exception_handler(DatabaseError)
async def database_error_handler(request: Request, exc: DatabaseError):
    """Handle database errors with 503 Service Unavailable"""
    logger.error(f"Database error: {exc.message}", extra={"detail": exc.detail})
    return JSONResponse(
        status_code=503,
        content=ErrorResponse(
            error="database_error",
            message=exc.message,
            detail=exc.detail,
        ).model_dump(),
    )


@app.exception_handler(AuthenticationError)
async def authentication_error_handler(request: Request, exc: AuthenticationError):
    """Handle authentication errors with 401 Unauthorized"""
    logger.warning(f"Authentication error: {exc.message}")
    return JSONResponse(
        status_code=401,
        content=ErrorResponse(
            error="authentication_error",
            message=exc.message,
            detail=exc.detail,
        ).model_dump(),
    )


@app.exception_handler(NotFoundError)
async def not_found_error_handler(request: Request, exc: NotFoundError):
    """Handle not found errors with 404 Not Found"""
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(
            error="not_found",
            message=exc.message,
            detail=exc.detail,
        ).model_dump(),
    )


@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    """Handle validation errors with 400 Bad Request"""
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(
            error="validation_error",
            message=exc.message,
            detail=exc.detail,
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    """Catch-all handler for unexpected errors - log details, return generic message"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="internal_error",
            message="An internal error occurred. Please try again later.",
            detail=None,  # Don't expose internal error details to clients
        ).model_dump(),
    )


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        supabase = get_supabase()
        print("✓ Supabase client initialized successfully")
    except Exception as e:
        print(f"✗ Failed to initialize Supabase client: {e}")
        raise


# API Routes - To be implemented in future phases
# Phase 4: Authentication
# app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Phase 5: Google Places
# app.include_router(places.router, prefix="/api/places", tags=["places"])

# Phase 9-11: User Data
# app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {"message": "Noms API", "status": "healthy"}


@app.get("/health")
async def health_check(response: Response):
    """Health check endpoint with database connectivity verification"""
    try:
        # Test database connection with a simple query
        supabase = get_supabase()
        supabase.table("users").select("id").limit(1).execute()

        return {"status": "ok", "database": "connected"}
    except Exception as e:
        # Database is down or unreachable
        response.status_code = 503
        return {"status": "degraded", "database": "disconnected", "error": str(e)}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
