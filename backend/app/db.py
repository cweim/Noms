"""
Database connection module for Supabase
Provides singleton Supabase client for backend operations
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase client singleton
_supabase_client: Client | None = None


def get_supabase() -> Client:
    """
    Get Supabase client instance (singleton pattern)

    Uses SERVICE_KEY (not ANON_KEY) to bypass Row Level Security.
    Backend needs admin access to:
    - Create/cache places from Google Places API
    - Query across users for recommendations
    - Perform admin operations

    Client-side requests should use ANON_KEY with RLS enforcement.
    """
    global _supabase_client

    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")

        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment"
            )

        _supabase_client = create_client(url, key)

    return _supabase_client
