# Noms

## What This Is

A map-first food app that helps urban eaters decide quickly when hungry, save inspiration naturally, and remember what they actually ate. Designed to be useful for a single user on day one and improve automatically as usage accumulates through a calm, low-friction mobile experience.

## Core Value

The product must be useful for a single user on day one and improve automatically as usage accumulates.

## Requirements

### Validated

- ✓ Map-based restaurant picker with location context and spatial awareness — v1.0, enhanced v1.1
- ✓ Swipeable restaurant cards for quick decision-making (skip/like actions) — v1.0
- ✓ Save places to lists (default: Saved) — v1.0
- ✓ Personal food journal (photo-first with optional 1-tap rating) — v1.0
- ✓ On-demand restaurant lookup via Google Places API — v1.0
- ✓ Saved places persist across app restarts — v1.0
- ✓ Journal entries correctly link to places — v1.0
- ✓ App functions without any social connections — v1.0
- ✓ Bottom card layout with map centering on current restaurant — v1.1
- ✓ "Consider now" temp list for decision narrowing — v1.1
- ✓ Place details screen with photo gallery, contact info, hours — v1.1

### Active

- [ ] User can select a restaurant within 60 seconds (needs timing validation)
- [ ] Passive themed list suggestions in UI
- [ ] Preference-based dietary filters for ranking

### Out of Scope

- Full social feed — single-user focus for MVP
- Influencer discovery — personal tool, not social network
- Long-form reviews — low-friction journaling only
- Menu-level recommendations — place-level discovery only
- Bulk ingestion or indexing of all restaurants in a city — on-demand fetching only, API constraints

## Context

**Current State (v1.1 shipped 2026-01-19):**
- ~5,200 LOC total (3,644 mobile TypeScript + 1,590 backend Python)
- 17 phases, 31 plans completed across 2 milestones
- Core flows working: Now picker, Saved places, Photo journal
- v1.1 added: bottom card layout, temp list, place details screen

**Product Stage:**
- Post-MVP, ready for user testing
- Core UX patterns established
- Focus on feedback and iteration

**User Jobs:**
1. Primary: Decide where to eat now (in-the-moment decision under time pressure)
2. Secondary: Collect good places for later (visual, reusable saves)
3. Tertiary: Remember what they ate and liked (lightweight personal memory)

**UX Principles:**
- Interfaces should feel calm and low-density
- Decisions should require minimal typing
- App must be usable with one hand
- Playful and tactile design (warm colors, soft shadows, rounded shapes)

**Technical Environment:**
- React Native with Expo for mobile client
- FastAPI (Python) for backend API server
- PostgreSQL for persistence
- Supabase Auth for authentication
- Google Places API for restaurant discovery

**Architecture Pattern:**
- Mobile client renders map, cards, and journal UI
- Client calls backend API for recommendations and persistence
- Backend queries Google Places API on-demand per request
- Backend stores user-generated data (saved places, journal entries)
- No background ingestion jobs — keep logic simple and explicit

## Constraints

- **Platform**: Mobile-first, iOS primary with Android testing — React Native/Expo chosen for cross-platform support
- **External Data**: On-demand restaurant fetching only, no crawling/scraping/pre-indexing — aligns with API usage limits and product design
- **Result Sets**: Limited and partial result sets expected and intentional — ranking logic works within fetched results, not exhaustive city-wide data
- **UX**: Must be calm, low-density, minimal typing, one-handed usable — core product principle, not negotiable
- **Single User**: No social features, no coordination overhead — sufficient for MVP validation
- **Recommendation Logic**: Rule-based, not ML-driven — simpler implementation, faster iteration
- **Code Style**: Simple and explicit, prefer readability over abstraction — aligns with early stage and solo development

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Google Places API | Comprehensive restaurant data, familiar to users, good mobile SDK support | ✓ Good — works well, photos via proxy |
| Supabase Auth | Open source, native PostgreSQL integration, includes user management | ✓ Good — JWT validation simple |
| FastAPI (Python) backend | Fast prototyping, type safety with Pydantic, async support for API calls | ✓ Good — clean API design |
| Query param auth for photos | Image components can't send headers, needed for authenticated photo URLs | ✓ Good — solved v1.1 bug |
| Session-only temp list | "Consider now" list doesn't need persistence, simplifies implementation | ✓ Good — appropriate for use case |
| Bottom card + map centering | Spatial context helps decision-making, map-first design principle | ✓ Good — v1.1 core improvement |
| Swipe up for "consider" | Distinct gesture from skip/save, natural "hold onto this" metaphor | ✓ Good — intuitive UX |
| Preference-based dietary filters | Influences ranking without strict exclusion, more options for users, MVP-friendly | — Deferred to v1.2 |
| Passive themed list suggestions | Show organization option in UI without prompting, lower friction for MVP | — Deferred to v1.2 |
| Journal: Photo + optional 1-tap rating | Balances zero-effort logging with useful data capture for future recommendations | ✓ Good — working in v1.0 |
| iOS primary, Android tested | Focused testing on primary platform while ensuring cross-platform doesn't break | — Pending testing |

---
*Last updated: 2026-01-19 after v1.1 milestone*
