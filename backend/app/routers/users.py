"""
Users router - endpoints for user profile and data
All endpoints require JWT authentication via get_current_user dependency
"""

from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.db import get_supabase
from app.errors import NotFoundError

router = APIRouter()


@router.get("/me")
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's profile.

    Requires: Authorization: Bearer <jwt>

    Returns user profile with:
    - user_id: UUID from JWT sub claim
    - email: Email from JWT
    - created_at: Profile creation timestamp
    - updated_at: Last profile update timestamp
    """
    user_id = user["sub"]

    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).execute()

    # User should always exist due to trigger, but handle edge case
    if not result.data:
        raise NotFoundError(
            message="User profile not found",
            detail={
                "user_id": user_id,
                "hint": "Profile may not have been created. Check trigger."
            }
        )

    profile = result.data[0]

    return {
        "user_id": user_id,
        "email": user.get("email"),
        "created_at": profile["created_at"],
        "updated_at": profile["updated_at"],
    }
