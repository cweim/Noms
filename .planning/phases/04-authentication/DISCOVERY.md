# Phase 4: Authentication - Discovery

## Integration Pattern

### How Supabase Auth Works with FastAPI

Supabase Auth manages user authentication separately from your application's data tables through a dedicated `auth` schema in PostgreSQL. This separation provides several key benefits:

**Architecture:**
- **auth.users table**: Managed by Supabase, stores authentication credentials (email, password hash, phone, OAuth providers)
- **public.users table**: Your application's user profile table, references auth.users via foreign key
- **JWTs**: Supabase issues signed JSON Web Tokens for authenticated users, validated locally in FastAPI

**Key Principles:**
1. Supabase Auth handles the authentication (signup, login, password reset, email verification)
2. Your FastAPI backend validates JWTs to protect endpoints
3. Custom user data lives in `public.users` (or `public.profiles`), linked to `auth.users` via foreign key
4. The `auth` schema is never exposed via auto-generated APIs for security

**Our Current Setup:**
- Database already has `users` table with `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- This is the correct pattern - we use Supabase Auth for authentication, custom table for app data
- No password_hash column needed in our users table (Supabase Auth handles this)

### Authentication Flow

**Client-Side (React Native/Expo):**
```
User → Supabase Auth SDK (signup/login) → Receives JWT tokens → Sends JWT in requests
```

**Server-Side (FastAPI):**
```
Request with JWT → Validate JWT locally → Extract user ID → Query user data → Respond
```

**Two Integration Approaches:**

1. **Client → Supabase Auth (Recommended for MVP)**
   - Mobile app uses Supabase JS SDK to call Supabase Auth directly
   - FastAPI only validates JWTs, doesn't handle signup/login
   - Simpler backend, leverages Supabase's built-in features (email verification, password reset)
   - FastAPI endpoints focus on protected operations (create journal entry, save place, etc.)

2. **Client → FastAPI → Supabase Auth (Alternative)**
   - Backend provides signup/login endpoints that wrap Supabase Auth calls
   - More control, but adds backend complexity
   - Useful if you need custom validation or multi-step signup flows

**Recommendation**: Use approach 1 for MVP. Let Supabase handle auth operations client-side, FastAPI validates tokens.

### API Keys vs User JWTs

Understanding the three types of credentials:

| Key Type | Purpose | RLS Enforcement | Where Used | Security |
|----------|---------|-----------------|------------|----------|
| **ANON_KEY** | Public client access | Yes | React Native app | Safe to expose |
| **SERVICE_KEY** | Backend admin operations | No (bypasses RLS) | FastAPI backend | Never expose |
| **User JWT** | Authenticated user requests | Yes | Client requests after login | Short-lived tokens |

**Current Setup:**
- Backend uses `SUPABASE_SERVICE_KEY` for admin operations (correct)
- Client will use `SUPABASE_ANON_KEY` with Supabase Auth SDK
- After login, user receives JWT (access_token + refresh_token)
- FastAPI validates user JWTs to protect endpoints

**Important**: The SERVICE_KEY bypasses Row Level Security. For user-scoped operations, we'll need to validate user JWTs and use RLS policies.

## Implementation Approach

### FastAPI JWT Validation Pattern

**Standard Pattern: HTTPBearer + Dependency Injection**

Create a custom dependency that validates Supabase JWTs on protected routes.

**Required Library:**
- **PyJWT** (already available) or **python-jose** (provides better error messages)
- Both work with HS256 symmetric JWT validation

**Implementation Steps:**

1. **Get JWT Secret from Supabase Dashboard**
   - Location: Project Settings → API → JWT Settings
   - Environment variable: `SUPABASE_JWT_SECRET`

2. **Create JWT Validator Dependency**

```python
# backend/app/auth.py
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Validates Supabase JWT and returns user claims.

    Raises:
        HTTPException 401: If token is invalid or expired

    Returns:
        dict: JWT payload with user_id, email, role, etc.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer authentication required",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )
```

3. **Protect Routes with Dependency**

```python
# backend/app/routers/users.py
from fastapi import APIRouter, Depends
from app.auth import get_current_user

router = APIRouter()

@router.get("/me")
async def get_profile(user: dict = Depends(get_current_user)):
    """Get current user's profile - requires valid JWT"""
    user_id = user["sub"]  # JWT 'sub' claim contains user UUID
    # Query database for user profile
    return {"user_id": user_id, "email": user["email"]}

@router.post("/journal")
async def create_journal_entry(
    entry_data: JournalEntryCreate,
    user: dict = Depends(get_current_user)
):
    """Create journal entry - requires authentication"""
    user_id = user["sub"]
    # Create entry for authenticated user
    pass
```

**JWT Claims in Supabase Tokens:**
- `sub`: User UUID (use this as user_id in database queries)
- `email`: User's email address
- `role`: Postgres role for RLS ("authenticated" for logged-in users)
- `aud`: Audience claim (always "authenticated" for user JWTs)
- `exp`: Expiration timestamp
- `iss`: Issuer URL (e.g., `https://yourproject.supabase.co/auth/v1`)

### Alternative: JWKS Verification (Modern Approach)

For production, consider using JWKS (JSON Web Key Set) instead of symmetric secrets:

- Supabase exposes public keys at: `https://<project>.supabase.co/auth/v1/.well-known/jwks.json`
- Uses asymmetric RS256 instead of HS256
- More secure (JWT secret never leaves Supabase)
- Requires different library setup (PyJWT with `jwcrypto` or `python-jose`)

**Recommendation**: Start with HS256 for MVP, migrate to JWKS in production.

## Authentication Flow

### Signup Flow

**Client-Side Implementation (React Native):**

```typescript
// Using @supabase/supabase-js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Signup with email/password
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password',
  options: {
    data: {
      // Optional metadata stored in auth.users.raw_user_meta_data
      // Useful for triggering profile creation
    }
  }
})

// If email confirmation is enabled (default):
// - data.user is populated, data.session is null
// - User receives confirmation email
// - Must click link to verify before login

// If email confirmation is disabled:
// - Both user and session are returned
// - User can login immediately
```

**Backend Role (Minimal):**

Backend doesn't need signup endpoints if using client-side Supabase Auth. However, you'll need a database trigger to create profile records:

```sql
-- Trigger already exists in Phase 2 migrations
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Note**: Check if this trigger exists from Phase 2. If not, add it in Phase 4 migration.

### Login Flow

**Client-Side:**

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})

// Returns:
// data.session.access_token - JWT for API requests
// data.session.refresh_token - Used to get new access tokens
// data.user - User object from auth.users
```

**Mobile App Token Storage:**
- Supabase JS SDK handles token storage automatically (secure storage on mobile)
- Access token included in all API requests to FastAPI
- SDK auto-refreshes expired tokens using refresh token

**FastAPI Usage:**
- Client sends: `Authorization: Bearer <access_token>`
- FastAPI dependency validates JWT
- Extract user_id from `sub` claim for database queries

### Password Reset Flow

**Handled entirely by Supabase Auth client-side:**

```typescript
// Request password reset email
await supabase.auth.resetPasswordForEmail('user@example.com')

// User clicks link in email, redirected to app with token
// App calls updateUser with new password
await supabase.auth.updateUser({ password: 'new_password' })
```

No backend endpoints needed for password reset.

### Email Verification

**Supabase handles via email templates:**
- Enable/disable in: Dashboard → Authentication → Email Templates
- Customize email templates and redirect URLs
- For mobile apps, configure deep links to handle verification

**Verification Options:**
1. **Email confirmation enabled** (default): User must verify before login
2. **Email confirmation disabled**: User can login immediately (less secure)

**Recommendation**: Enable for production, consider disabling for development.

### Logout Flow

**Client-Side:**

```typescript
await supabase.auth.signOut()
// Clears session, removes tokens from storage
```

**Backend Consideration:**
- JWTs remain valid until expiration (typically 1 hour)
- Cannot "revoke" a JWT from backend (stateless tokens)
- For immediate logout, would need token blacklist (added complexity)
- For MVP: Accept that tokens remain valid until expiry

## Session Management

### Token Lifecycle

**Access Token:**
- Short-lived JWT (default: 1 hour expiration)
- Sent with every API request in Authorization header
- Validated locally by FastAPI (no network call to Supabase)
- Contains user claims (id, email, role)

**Refresh Token:**
- Long-lived token (default: stored securely by SDK)
- Used to obtain new access tokens when expired
- Managed automatically by Supabase JS SDK
- Backend never sees refresh tokens

**Token Refresh Flow:**
1. Client makes API request with expired access_token
2. FastAPI returns 401 Unauthorized
3. Supabase SDK detects 401, uses refresh_token to get new access_token
4. SDK retries request with new token
5. Request succeeds

**Automatic Refresh:**
The `@supabase/supabase-js` SDK handles this automatically. No manual refresh logic needed in React Native app.

### Accessing User Context in Routes

**Pattern 1: Extract from JWT (Recommended)**

```python
@router.post("/journal")
async def create_entry(
    data: JournalEntryCreate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]  # UUID from JWT
    user_email = user["email"]

    # Create database record scoped to user_id
    entry = await create_journal_entry(user_id, data)
    return entry
```

**Pattern 2: Query Database for Profile**

```python
async def get_current_user_profile(
    user: dict = Depends(get_current_user)
) -> UserProfile:
    """Enriched dependency that fetches profile from database"""
    user_id = user["sub"]

    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()

    if not result.data:
        raise HTTPException(404, "User profile not found")

    return UserProfile(**result.data)

@router.get("/profile")
async def get_profile(profile: UserProfile = Depends(get_current_user_profile)):
    return profile
```

**When to Query Database:**
- If you need data not in JWT (preferences, settings, etc.)
- If user data might have changed since token was issued
- For endpoints that need full user profile

**When to Use JWT Only:**
- When you only need user_id and email
- For performance (avoids database query)
- Most endpoints can use JWT claims only

### Session Expiration Strategy

**Recommended Configuration:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| Access token expiry | 1 hour (default) | Balance between security and UX |
| Refresh token expiry | 7 days (default) | User stays logged in for a week |
| JWT secret rotation | Manual (for MVP) | Automate in production |

**User Experience:**
- User logs in once, stays logged in for 7 days
- Access tokens refresh silently in background
- After 7 days, user must log in again
- No disruptive "session expired" messages during active use

**Security Considerations:**
- Shorter access tokens limit exposure if compromised
- Refresh tokens stored securely by SDK (encrypted on device)
- For MVP, 1 hour / 7 days is reasonable
- Production: Consider refresh token rotation for enhanced security

### Cookie-Based Sessions (Alternative)

Some implementations use HTTP-only cookies instead of Authorization headers:

**Pros:**
- Immune to XSS attacks (can't read HTTP-only cookies from JavaScript)
- Automatic CSRF protection if configured correctly

**Cons:**
- More complex server-side session management
- Doesn't work well with React Native (primarily for web)
- Requires FastAPI to handle signup/login (can't use Supabase Auth client-side)

**Recommendation**: Stick with JWT Bearer tokens for mobile-first app. Simpler and works natively with Supabase SDK.

## Recommended Stack

### Libraries

**Backend (FastAPI):**
```
# Already in requirements.txt:
supabase==2.3.0       # Supabase Python client
fastapi==0.109.0      # Web framework
pydantic==2.5.0       # Data validation

# Add for Phase 4:
PyJWT==2.8.0          # JWT validation (or python-jose[cryptography]==3.3.0)
python-dotenv==1.0.0  # Already installed - for env vars
```

**Why PyJWT:**
- Lightweight, standard library for JWT operations
- Works well with HS256 symmetric signing
- Easy to upgrade to RS256/JWKS later
- Alternative: python-jose provides more helpful error messages, but heavier dependency

**Frontend (React Native):**
```
# Add for Phase 4:
@supabase/supabase-js  # Supabase client SDK (handles auth automatically)
```

**Environment Variables:**
```bash
# Backend (.env)
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...  # Public key for RLS
SUPABASE_SERVICE_KEY=eyJhbGc...  # Already configured
SUPABASE_JWT_SECRET=your-jwt-secret  # NEW - for validating JWTs

# Frontend (React Native .env)
EXPO_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Architecture Pattern

**Client → Supabase Auth (Direct)**

```
┌─────────────────┐
│  React Native   │
│   (Expo App)    │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         │ Auth Operations                 │ Protected API Calls
         │ (signup, login, logout)         │ (with JWT Bearer token)
         │                                 │
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│  Supabase Auth  │              │  FastAPI        │
│  (Auth Service) │              │  Backend        │
└─────────────────┘              └────────┬────────┘
                                          │
                                          │ Validate JWT
                                          │ Query user data
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  PostgreSQL     │
                                 │  (Supabase DB)  │
                                 │  - auth.users   │
                                 │  - public.users │
                                 └─────────────────┘
```

**Flow:**
1. User signs up/logs in → React Native calls Supabase Auth directly
2. Supabase returns JWT tokens → SDK stores securely
3. User accesses protected feature → React Native calls FastAPI with JWT
4. FastAPI validates JWT → Extracts user_id → Queries database → Returns data

**Advantages:**
- Leverages Supabase's built-in auth features (email verification, password reset, OAuth)
- Simpler FastAPI backend (no auth endpoints needed)
- Automatic token refresh handled by SDK
- Works well for mobile apps

**When Backend Needs Auth Endpoints:**
- Custom signup validation (e.g., invite codes, domain restrictions)
- Multi-step registration flows
- Integration with external systems during signup
- Custom session management

For MVP: Direct client-side auth is simpler and recommended.

## Common Pitfalls

### 1. Using SERVICE_KEY for User Operations

**Problem:**
```python
# WRONG - bypasses Row Level Security
supabase = get_supabase()  # Uses SERVICE_KEY
result = supabase.table("journal_entries").select("*").execute()
# Returns ALL entries from ALL users!
```

**Solution:**
Either use user JWT with RLS, or filter manually:
```python
# Option A: Manual filtering (less secure)
user_id = user["sub"]
result = supabase.table("journal_entries").select("*").eq("user_id", user_id).execute()

# Option B: Use user's JWT with RLS (more secure, future work)
# Create user-scoped Supabase client with their JWT instead of SERVICE_KEY
```

**For MVP**: Manual filtering is acceptable. Consider RLS policies for production.

### 2. Not Validating JWT Audience

**Problem:**
```python
# WRONG - doesn't verify audience claim
payload = jwt.decode(token, secret, algorithms=["HS256"])
# Could accept service role tokens or malformed JWTs
```

**Solution:**
```python
# CORRECT - verify audience is "authenticated"
payload = jwt.decode(
    token,
    secret,
    algorithms=["HS256"],
    audience="authenticated"  # Ensures it's a user JWT
)
```

### 3. Exposing JWT Secret in Client

**Problem:**
Including `SUPABASE_JWT_SECRET` in React Native app environment.

**Solution:**
- JWT secret stays on backend only
- Client uses `SUPABASE_ANON_KEY` for Supabase SDK
- Client receives JWTs from Supabase, doesn't create them

### 4. Not Handling Token Expiration

**Problem:**
App doesn't detect when access token expires, user sees errors.

**Solution:**
The Supabase JS SDK handles this automatically:
```typescript
// SDK auto-refreshes expired tokens
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed automatically')
  }
})
```

Trust the SDK, but handle 401 errors gracefully in UI.

### 5. Forgetting Database Trigger for User Profiles

**Problem:**
User signs up via Supabase Auth, but no record in `public.users` table.

**Solution:**
Ensure trigger exists to auto-create profile:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Check if Phase 2 migration included this. If not, add in Phase 4 migration.

### 6. Hardcoding Algorithm or Audience

**Problem:**
```python
# WRONG - vulnerable if Supabase changes config
payload = jwt.decode(token, secret, algorithms=["RS256"])
```

**Solution:**
Use HS256 (Supabase default) and "authenticated" audience. If Supabase migrates to RS256/JWKS, update accordingly.

### 7. Not Testing Email Verification in Development

**Problem:**
Email confirmation enabled in production, but not tested locally. Users can't sign up.

**Solution:**
- Disable email confirmation in development (Supabase Dashboard → Auth settings)
- Use Supabase email testing tools (Inbucket integration)
- Or configure custom SMTP for development emails

### 8. Assuming JWT Contains All User Data

**Problem:**
```python
# WRONG - expecting fields not in JWT
user_preferences = user["dietary_preferences"]  # KeyError!
```

**Solution:**
JWT only contains: `sub`, `email`, `role`, `aud`, `iss`, `exp`, `iat`. For other data, query database:
```python
user_id = user["sub"]
profile = await get_user_profile(user_id)
preferences = profile.dietary_preferences
```

## Code Examples

### Minimal JWT Validation (FastAPI)

```python
# backend/app/auth.py
import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

# Security scheme for OpenAPI docs
security = HTTPBearer()

# JWT configuration
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
        HTTPException 401: If token is missing, invalid, or expired

    Returns:
        dict: JWT payload containing user claims (sub, email, role, etc.)
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer authentication required",
            headers={"WWW-Authenticate": "Bearer"},
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

### Protected Route Example

```python
# backend/app/routers/users.py
from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.db import get_supabase

router = APIRouter()


@router.get("/me")
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """
    Get current user's profile.
    Requires: Authorization: Bearer <jwt>
    """
    user_id = user["sub"]

    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()

    return {
        "user_id": user_id,
        "email": user["email"],
        "created_at": result.data["created_at"],
        "updated_at": result.data["updated_at"],
    }


@router.post("/journal")
async def create_journal_entry(
    entry_data: dict,  # Replace with Pydantic model
    user: dict = Depends(get_current_user)
):
    """
    Create a journal entry for the authenticated user.
    Requires: Authorization: Bearer <jwt>
    """
    user_id = user["sub"]

    supabase = get_supabase()
    result = supabase.table("journal_entries").insert({
        "user_id": user_id,
        "place_id": entry_data["place_id"],
        "photo_url": entry_data["photo_url"],
        "rating": entry_data.get("rating"),
        "notes": entry_data.get("notes"),
    }).execute()

    return result.data
```

### React Native Client Setup (For Reference)

```typescript
// app/lib/supabase.ts
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,  // Persist session across app restarts
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

```typescript
// Example: Signup
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
})

// Example: Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})

// Example: Get session
const { data: { session } } = await supabase.auth.getSession()
const accessToken = session?.access_token

// Example: Call protected FastAPI endpoint
const response = await fetch('http://localhost:8000/api/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
})
```

### Optional: User-Scoped Supabase Client

For more secure operations using Row Level Security:

```python
# backend/app/auth.py (additional helper)
from supabase import create_client, Client
import os

def get_user_supabase_client(access_token: str) -> Client:
    """
    Create a Supabase client scoped to the user's JWT.
    This client respects Row Level Security policies.

    Use for user-scoped operations instead of SERVICE_KEY client.
    """
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY")

    client = create_client(url, anon_key)
    client.auth.set_session(access_token, refresh_token="")  # Only need access token

    return client


# Usage in route:
@router.get("/journal")
async def get_journal_entries(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Validate token first
    user = await get_current_user(credentials)

    # Create user-scoped client that respects RLS
    user_client = get_user_supabase_client(credentials.credentials)

    # This query automatically filters by user_id via RLS policy
    result = user_client.table("journal_entries").select("*").execute()

    return result.data
```

Note: This requires RLS policies configured. For MVP, manual filtering with SERVICE_KEY is simpler.

---

## Summary

**For Phase 4 Planning:**

1. **Backend Tasks:**
   - Add `SUPABASE_JWT_SECRET` to environment variables
   - Install `PyJWT` library
   - Create `backend/app/auth.py` with `get_current_user` dependency
   - Verify database trigger for user profile creation exists (from Phase 2)
   - Add migration if trigger is missing

2. **No Backend Endpoints Needed:**
   - Signup/login handled client-side by Supabase Auth
   - FastAPI only validates JWTs, doesn't issue them

3. **Frontend Tasks (Phase 6+):**
   - Install `@supabase/supabase-js`
   - Configure Supabase client with ANON_KEY
   - Implement signup/login UI screens
   - Store and send JWT with API requests

4. **Testing:**
   - Test JWT validation with valid/invalid/expired tokens
   - Verify protected routes return 401 without token
   - Test user signup creates profile in `public.users`
   - Verify token refresh works automatically

5. **Documentation:**
   - Document JWT claims structure
   - API docs showing Authorization header requirement
   - Environment variable setup instructions

**Next Steps After Discovery:**
Create PLAN.md files for Phase 4 implementation based on these patterns.
