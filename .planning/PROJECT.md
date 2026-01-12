# Noms

## What This Is

A map-first food app that helps urban eaters decide quickly when hungry, save inspiration naturally, and remember what they actually ate. Designed to be useful for a single user on day one and improve automatically as usage accumulates through a calm, low-friction mobile experience.

## Core Value

The product must be useful for a single user on day one and improve automatically as usage accumulates.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Map-based restaurant picker with location context and spatial awareness
- [ ] Swipeable restaurant cards for quick decision-making (skip/like actions)
- [ ] Save places to lists (default: Saved, with passive themed list option in UI)
- [ ] Personal food journal (photo-first with optional 1-tap rating)
- [ ] On-demand restaurant lookup via Google Places API
- [ ] User can select a restaurant within 60 seconds
- [ ] Saved places persist across app restarts
- [ ] Journal entries correctly link to places
- [ ] App functions without any social connections

### Out of Scope

- Full social feed — single-user focus for MVP
- Influencer discovery — personal tool, not social network
- Long-form reviews — low-friction journaling only
- Menu-level recommendations — place-level discovery only
- Bulk ingestion or indexing of all restaurants in a city — on-demand fetching only, API constraints

## Context

**Product Stage:**
- Early MVP stage, UI and data models expected to evolve
- Backward compatibility not guaranteed
- Focus on shipping and learning quickly

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
| Google Places API | Comprehensive restaurant data, familiar to users, good mobile SDK support | — Pending |
| Supabase Auth | Open source, native PostgreSQL integration, includes user management | — Pending |
| FastAPI (Python) backend | Fast prototyping, type safety with Pydantic, async support for API calls | — Pending |
| Preference-based dietary filters | Influences ranking without strict exclusion, more options for users, MVP-friendly | — Pending |
| Passive themed list suggestions | Show organization option in UI without prompting, lower friction for MVP | — Pending |
| Journal: Photo + optional 1-tap rating | Balances zero-effort logging with useful data capture for future recommendations | — Pending |
| iOS primary, Android tested | Focused testing on primary platform while ensuring cross-platform doesn't break | — Pending |

---
*Last updated: 2026-01-13 after initialization*
