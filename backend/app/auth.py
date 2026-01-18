"""
JWT Authentication module for Supabase Auth
Validates JWTs issued by Supabase Auth for protected endpoints
Uses JWKS (JSON Web Key Set) for ES256 token verification
"""

import os
import logging
import httpx
import jwt
from jwt import PyJWKClient
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from app.errors import AuthenticationError

load_dotenv()

# Security scheme for OpenAPI docs
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
JWT_AUDIENCE = "authenticated"

# JWKS client for fetching public keys (with caching)
_jwks_client = None

def get_jwks_client():
    """Get or create JWKS client for Supabase."""
    global _jwks_client
    if _jwks_client is None:
        if not SUPABASE_URL:
            raise AuthenticationError(
                message="Server misconfigured: SUPABASE_URL not set",
                detail={"hint": "Set SUPABASE_URL environment variable"}
            )
        jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


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
    if not credentials:
        raise AuthenticationError(
            message="Bearer authentication required",
            detail={"hint": "Include Authorization: Bearer <token> header"}
        )

    token = credentials.credentials

    try:
        # Get the signing key from JWKS
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
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
        logging.warning(f"JWT validation failed: {type(e).__name__}: {e}")
        raise AuthenticationError(
            message="Invalid authentication token",
            detail={"error": str(e), "type": type(e).__name__}
        )

    except Exception as e:
        logging.warning(f"Auth error: {type(e).__name__}: {e}")
        raise AuthenticationError(
            message="Authentication failed",
            detail={"error": str(e)}
        )
