---
phase: 13-bug-fix-backend-prep
plan: 01
type: summary
---

# Summary: Fix Saved Places Images Bug

## What Was Done

Fixed the bug where saved places images were not displaying. The root cause was that the photo endpoint required JWT authentication via Authorization header, but React Native's `<Image>` component cannot send custom headers when fetching URLs.

## Root Cause Analysis

1. **Photo endpoint required header auth**: `GET /api/places/{place_id}/photo` used `Depends(get_current_user)` which requires `Authorization: Bearer <token>` header
2. **Image components can't send headers**: React Native's `<Image source={{ uri: url }} />` makes a standard GET request without ability to add headers
3. **Result**: All photo requests returned 401 Unauthorized, causing images to fail silently

## Solution

Implemented query parameter authentication for the photo endpoint:

1. **Backend** (`backend/app/routers/places.py`):
   - Modified photo endpoint to accept `?token=<jwt>` query parameter
   - Added inline JWT validation using `get_jwks_client()` and PyJWT
   - Validates token audience and signature same as header-based auth

2. **Mobile** (`mobile/lib/api.ts`):
   - Added `getAuthToken()` function to retrieve current session token
   - Added `getPhotoUrl(googlePlaceId, token, maxWidth)` helper to construct authenticated URLs

3. **Mobile** (`mobile/app/(tabs)/saved.tsx`):
   - Added token state that fetches on mount and refresh
   - Updated `SavedPlaceCard` to accept token prop
   - Photo URL now includes `?token=` parameter for authentication

## Files Changed

| File | Change |
|------|--------|
| `backend/app/routers/places.py` | Added query param token validation to photo endpoint |
| `mobile/lib/api.ts` | Added `getAuthToken()` and `getPhotoUrl()` helpers |
| `mobile/app/(tabs)/saved.tsx` | Pass auth token to photo URLs |

## Verification

- [x] TypeScript check passes: `npx tsc --noEmit`
- [x] Python imports work correctly
- [x] Photo endpoint accepts `?token=` query parameter
- [x] SavedPlaceCard constructs authenticated photo URLs

## Notes

- The fix also prepares for future picker card photos (Phase 14 redesign)
- Token is refreshed on pull-to-refresh to handle expiration
- Places without photos still show no image (expected behavior)
