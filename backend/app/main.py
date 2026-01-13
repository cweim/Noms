"""
Noms Backend API
FastAPI server for the Noms food discovery app
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import get_supabase

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


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        supabase = get_supabase()
        print("✓ Supabase client initialized successfully")
    except Exception as e:
        print(f"✗ Failed to initialize Supabase client: {e}")
        raise


@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {"message": "Noms API", "status": "healthy"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
