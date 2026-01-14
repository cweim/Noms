"""
JWT Authentication module for Supabase Auth
Validates JWTs issued by Supabase Auth for protected endpoints
"""

import os
import jwt
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from app.errors import AuthenticationError

load_dotenv()

# Security scheme for OpenAPI docs
security = HTTPBearer()

# JWT configuration - Supabase uses HS256 with JWT secret
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_AUDIENCE = "authenticated"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency that validates Supabase JWT and returns user claims.

    Usage:
        @router.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            user_id = user["sub"]
            # ... your logic

    Raises:
        AuthenticationError: If token is missing, invalid, or expired

    Returns:
        dict: JWT payload containing user claims (sub, email, role, etc.)
    """
    if not JWT_SECRET:
        raise AuthenticationError(
            message="Server misconfigured: JWT secret not set",
            detail={"hint": "Set SUPABASE_JWT_SECRET environment variable"}
        )

    if not credentials:
        raise AuthenticationError(
            message="Bearer authentication required",
            detail={"hint": "Include Authorization: Bearer <token> header"}
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            audience=JWT_AUDIENCE,
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise AuthenticationError(
            message="Token has expired",
            detail={"hint": "Refresh your authentication token"}
        )

    except jwt.InvalidAudienceError:
        raise AuthenticationError(
            message="Invalid token audience",
            detail={"expected": JWT_AUDIENCE}
        )

    except jwt.InvalidTokenError as e:
        raise AuthenticationError(
            message="Invalid authentication token",
            detail={"error": str(e)}
        )
