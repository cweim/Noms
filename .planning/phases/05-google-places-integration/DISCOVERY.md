# Phase 5: Google Places Integration - Discovery

**Level:** 2 - Standard Research
**Date:** 2026-01-14
**Duration:** ~15 min

## Research Topics

1. Google Places API (New vs Legacy)
2. Python client library options
3. Pricing and rate limits
4. Search and details endpoints
5. Caching strategy

## Findings

### 1. API Version Decision: Legacy API

**Decision: Use the Legacy Places API with `googlemaps` library.**

**Rationale:**
- The `googlemaps` library (v4.10.0) is the established community-supported Python client
- It uses the Legacy API endpoints (`/maps/api/place/nearbysearch/json`, `/maps/api/place/textsearch/json`)
- Simple and well-documented with methods like `places_nearby()`, `places()`, `places_photo()`
- The New API (Places API New) requires different authentication (ADC) and a different library (`google-maps-places`)
- For MVP, the Legacy API is sufficient and simpler to integrate

**Note:** Google is designating Legacy APIs but they remain functional. Can migrate to New API later if needed.

### 2. Python Library: googlemaps

**Package:** `googlemaps==4.10.0`
**Install:** `pip install googlemaps`

**Key Methods:**
```python
import googlemaps

gmaps = googlemaps.Client(key='GOOGLE_PLACES_API_KEY')

# Text search - restaurants near location
results = gmaps.places(
    query="restaurants",
    location=(37.7749, -122.4194),
    radius=1000
)

# Nearby search - by type and location
results = gmaps.places_nearby(
    location=(37.7749, -122.4194),
    radius=1000,
    type="restaurant"
)

# Place details
details = gmaps.place(place_id="ChIJN1t_tDeuEmsRUsoyG83frY4")

# Photo download
photo_data = gmaps.places_photo(
    photo_reference="photo_reference_string",
    max_width=400
)
```

### 3. Pricing (Effective March 2025)

**Relevant SKUs:**
- **Nearby Search:** ~$32/1000 requests (Basic fields)
- **Text Search:** ~$32/1000 requests (Basic fields)
- **Place Details:** ~$17/1000 requests (Basic fields)
- **Place Photo:** ~$7/1000 requests

**Free monthly usage:** Each SKU gets some free requests starting March 2025.

**Cost optimization:**
- Request only needed fields (field masks)
- Cache place data to avoid repeated API calls
- Use `places` table to store cached results

### 4. API Endpoints (Legacy)

**Text Search:**
- URL: `/maps/api/place/textsearch/json`
- Method: GET (via library)
- Returns: Up to 20 results per page
- Best for: "restaurants near me", "pizza in downtown"

**Nearby Search:**
- URL: `/maps/api/place/nearbysearch/json`
- Method: GET (via library)
- Returns: Up to 20 results per page
- Best for: Finding places by type within radius

**Place Details:**
- URL: `/maps/api/place/details/json`
- Returns: Full place information
- Use after search to get additional data

**Place Photo:**
- URL: `/maps/api/place/photo`
- Requires: photo_reference from search/details
- Returns: Raw image data

### 5. Caching Strategy

**Existing places table schema:**
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY,
  google_place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  photo_reference TEXT,
  types TEXT[],
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**Strategy:**
1. On search: Query Google API, cache results to `places` table
2. Before API call: Check if place exists in cache by `google_place_id`
3. Use `last_fetched_at` to determine if refresh needed (e.g., 7 days)
4. Save `photo_reference` for later photo fetching
5. Backend caches, mobile client uses cached data via our API

**Note:** RLS allows authenticated users to read places (public cache).

### 6. Response Structure

**Search Response (googlemaps library):**
```python
{
    "html_attributions": [],
    "results": [
        {
            "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
            "name": "Restaurant Name",
            "vicinity": "123 Main St",  # or formatted_address
            "geometry": {
                "location": {"lat": 37.7749, "lng": -122.4194}
            },
            "photos": [
                {"photo_reference": "...", "height": 800, "width": 600}
            ],
            "types": ["restaurant", "food"],
            "rating": 4.5,
            "price_level": 2,
            "opening_hours": {"open_now": true}
        }
    ],
    "next_page_token": "..."  # if more results
}
```

### 7. Error Handling

**Common errors:**
- `ZERO_RESULTS`: No places found (return empty list)
- `OVER_QUERY_LIMIT`: Rate limited (raise error, let client retry)
- `REQUEST_DENIED`: Invalid API key (raise error)
- `INVALID_REQUEST`: Bad parameters (raise validation error)

## Implementation Plan

### Endpoints to Create

1. **GET /api/places/search**
   - Query: `q` (search text), `lat`, `lng`, `radius` (optional, default 1000m)
   - Calls `gmaps.places()` with location bias
   - Caches results to places table
   - Returns list of places (cached data)

2. **GET /api/places/{place_id}**
   - Path: Internal UUID or Google place_id
   - Checks cache first
   - Calls `gmaps.place()` if not cached or stale
   - Returns place details

3. **GET /api/places/{place_id}/photo**
   - Query: `max_width` (default 400)
   - Fetches photo via `gmaps.places_photo()`
   - Streams image response

### Files to Create

- `backend/app/services/places.py` - Google Places API client wrapper
- `backend/app/routers/places.py` - API endpoints
- `backend/app/schemas/places.py` - Pydantic models for request/response

## Sources

- [Nearby Search (New) Documentation](https://developers.google.com/maps/documentation/places/web-service/nearby-search)
- [Text Search (New) Documentation](https://developers.google.com/maps/documentation/places/web-service/text-search)
- [googlemaps PyPI Package](https://pypi.org/project/googlemaps/)
- [Google Maps Services Python GitHub](https://github.com/googlemaps/google-maps-services-python)
- [Places API Pricing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [March 2025 Pricing Changes](https://developers.google.com/maps/billing-and-pricing/march-2025)
