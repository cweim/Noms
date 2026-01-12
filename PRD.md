## 1. Product Overview

**Problem (one sentence)**  
Food discovery is fragmented across maps, social apps, and memory, making in-the-moment decisions slow and inconsistent.

**Who it’s for**  
Urban eaters who frequently decide where to eat and want a calmer, faster, and more personal way to choose.

**Core value proposition**  
A map-first food app that helps users decide quickly when hungry, save inspiration naturally, and remember what they actually ate.

**Guiding principle**  
This product must be useful for a single user on day one and improve automatically as usage accumulates.

---

## 2. Users & Jobs-To-Be-Done

### Primary User
- **User type:** Urban individual eater
- **Job:** Decide where to eat now
- **Pain today:** Too many choices, excessive review scrolling
- **Outcome:** A small set of good options with spatial context

### Secondary User
- **User type:** Planner / explorer
- **Job:** Collect good places for later
- **Pain today:** Screenshots, messy lists, forgotten saves
- **Outcome:** Visual, reusable saved places

### Tertiary User
- **User type:** Reflective eater
- **Job:** Remember what they ate and liked
- **Pain today:** Photos without context, memory loss
- **Outcome:** Lightweight personal food journal

---

## 3. Core User Flows (MVP)

### Flow A: In-the-moment decision
1. User opens app
2. Map centers on location with a restaurant card
3. User swipes through options
4. User selects or saves a place

### Flow B: Save for later
1. User taps save on a place
2. Place is added to default **Saved** list
3. App may suggest organizing into themed lists later

### Flow C: Journal a meal
1. User takes or uploads a photo
2. App detects nearby place
3. User optionally adds a note or rating

---

## 4. Feature Scope

### In Scope (MVP)
- Map-based restaurant picker
- Swipeable restaurant cards
- Save places to lists (default: Saved)
- Personal food journal (photo-first)
- On-demand restaurant lookup

### Out of Scope (Explicit)
- Full social feed
- Influencer discovery
- Long-form reviews
- Menu-level recommendations
- Bulk ingestion or indexing of all restaurants in a city

---

## 5. Success Criteria (Acceptance)

- User can select a restaurant within 60 seconds
- Saved places persist across app restarts
- Journal entries correctly link to places
- App functions without any social connections

---

## 6. UX Principles (Non-Functional)

- Interfaces should feel calm and low-density
- Decisions should require minimal typing
- The app should be usable with one hand

---

## 7. Constraints & Assumptions

### Platform
- Mobile-first
- iOS initially

### External Data Constraints
- The product does **not** maintain a complete database of all restaurants
- Restaurant data is fetched **on-demand**
- Third-party APIs are used for lookup, not bulk ingestion
- Limited and partial result sets are expected and intentional

### Assumptions
- Single-user utility is sufficient for MVP
- Recommendation logic is rule-based, not ML-driven
- Filters influence ranking, not strict exclusion (unless required)

---

## 8. Open Questions

- Should dietary filters be strict or preference-based by default?
- How aggressively should the app suggest creating themed saved lists?
- What is the minimum acceptable friction for adding journal entries?