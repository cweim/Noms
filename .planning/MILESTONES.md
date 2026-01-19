# Project Milestones: Noms

## v1.1 Now Flow Redesign (Shipped: 2026-01-19)

**Delivered:** Redesigned the Now screen with bottom card layout, map centering, swipe-up "Consider now" temp list, and full place details screen.

**Phases completed:** 13-17 (8 plans total)

**Key accomplishments:**

- Fixed saved places images bug with token-authenticated photo URLs
- Redesigned Now screen with compact bottom card and map centering
- Implemented swipe up gesture for "Consider now" temp list
- Created TempListOverlay with review and selection flow
- Built PlaceDetailsScreen with photo gallery, contact info, hours
- Connected navigation from Now, Saved, and TempList to details

**Stats:**

- 32 files created/modified
- ~3,000 lines added (TypeScript/Python)
- 5 phases, 8 plans
- 2 days from start to ship

**Git range:** `fix(13-01)` → `feat(now): improve temp list UX`

**What's next:** Planning v1.2 or user testing feedback

---

## v1.0 MVP (Shipped: 2026-01-18)

**Delivered:** Map-first food discovery app with restaurant picker, saved places, and photo journal.

**Phases completed:** 1-12 (24 plans total)

**Key accomplishments:**

- Monorepo structure with FastAPI backend and React Native mobile
- PostgreSQL schema with Supabase Auth integration
- Google Places API integration with search and details
- Interactive map with location services and place markers
- Swipeable restaurant cards with skip/like actions
- Saved places list with persistent storage
- Photo journal with image capture and place detection
- Auth UI with login/signup flow

**Stats:**

- ~5,200 lines of code (3,600 mobile + 1,600 backend)
- 12 phases, 24 plans
- 6 days from start to ship

**Git range:** `feat(01-01)` → `feat(12-03)`

**What's next:** v1.1 Now Flow Redesign

---
