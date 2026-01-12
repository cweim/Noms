# Phase 2 Discovery: Database Schema

## Context

Designing PostgreSQL schema for the Noms app with Supabase. Need to support:
- User accounts (via Supabase Auth)
- Saved places (user's restaurant collections)
- Journal entries (photo-first food memories)
- Google Places data (on-demand, reference-based)

**Key constraint**: On-demand fetching only - no bulk ingestion of restaurant data.

## Research Questions

1. How should we integrate with Supabase Auth's user table?
2. Should we store full Google Places data or just place_id references?
3. How should we handle photo storage for journal entries?
4. What's the relationship between saves, lists, and places?

## Findings

### Supabase Auth Integration

**Decision: Reference Supabase auth.users, don't duplicate**

**Pattern:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Rationale:**
- Supabase Auth manages auth.users table automatically
- Our users table extends it with app-specific data
- CASCADE delete ensures cleanup when user deletes account
- UUID matches Supabase Auth's id type

### Google Places Data Storage

**Decision: Hybrid approach - cache essential fields, keep place_id for fresh lookups**

**Rationale:**
- **Don't store full place details** - Google Terms of Service restrictions on caching
- **Do cache display essentials** - name, address, photo_reference for offline/fast display
- **Always include place_id** - canonical identifier for fresh API lookups
- **TTL consideration** - Google allows 30-day cache, but we'll refresh on access

**Schema approach:**
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id TEXT UNIQUE NOT NULL,  -- Canonical Google ID
  name TEXT NOT NULL,                     -- Cached for display
  address TEXT,                           -- Cached for display
  photo_reference TEXT,                   -- For thumbnail, refreshable
  types TEXT[],                           -- ['restaurant', 'cafe']
  last_fetched_at TIMESTAMPTZ,           -- Track cache age
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Photo Storage for Journal

**Decision: Store URLs/paths, not BLOBs**

**Options evaluated:**
1. **Supabase Storage (recommended)** - Built-in, S3-compatible, CDN-backed
2. **PostgreSQL BYTEA** - Bad for large files, bloats backups
3. **External CDN** - Adds complexity

**Schema:**
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,               -- Supabase Storage URL
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),  -- Optional 1-5 rating
  note TEXT,                             -- Optional text note
  eaten_at TIMESTAMPTZ DEFAULT NOW(),    -- When they ate
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Storage path convention:** `{user_id}/journal/{entry_id}.jpg`

### Saves and Lists

**Decision: Implicit default list, explicit themed lists**

**Model:**
- Default "Saved" list is implicit (saves without list_id)
- Themed lists are explicit user-created collections
- Places can be in multiple lists (many-to-many)

**Schema:**
```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- e.g., "Date Night", "Quick Lunch"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE SET NULL,  -- NULL = default "Saved"
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id, list_id)     -- Prevent duplicate saves
);
```

## Complete Schema Design

### Core Tables

**users** - App-specific user data (extends Supabase auth.users)
- id → auth.users
- created_at, updated_at

**places** - Cached place data with Google place_id reference
- id, google_place_id (unique)
- name, address, photo_reference, types
- last_fetched_at (for cache management)

**lists** - User-created themed collections
- id, user_id
- name (e.g., "Date Night")

**saved_places** - User's saved restaurants
- id, user_id, place_id, list_id (nullable)
- list_id NULL = default "Saved" list
- Unique constraint prevents duplicates

**journal_entries** - Photo-first food memories
- id, user_id, place_id (nullable if place unknown)
- photo_url (Supabase Storage)
- rating (1-5, optional), note (optional)
- eaten_at, created_at

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_saved_places_user ON saved_places(user_id);
CREATE INDEX idx_saved_places_list ON saved_places(list_id);
CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_place ON journal_entries(place_id);
CREATE INDEX idx_places_google_id ON places(google_place_id);
```

### Timestamps

Use `TIMESTAMPTZ` (timestamp with time zone) for all timestamps:
- Supabase default
- Handles timezones correctly for global users
- Better for analytics and filtering

## Implementation Notes

### Migration Tool

Use **Supabase migrations** (not Alembic):
- CLI: `supabase migration new create_schema`
- Version controlled SQL files
- Applied with `supabase db push`

### Row Level Security (RLS)

Enable RLS on all tables:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Policy examples:
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own saves" ON saved_places
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Note:** RLS policies will be comprehensive in Phase 4 (Authentication).

### Updated Timestamps

Use trigger for `updated_at`:
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Decisions Summary

1. **Auth integration**: Reference auth.users, extend with users table
2. **Google Places**: Hybrid cache (display fields + place_id for refresh)
3. **Photos**: Supabase Storage URLs, not database BLOBs
4. **Lists**: Implicit default (list_id NULL), explicit themed lists
5. **Timestamps**: TIMESTAMPTZ everywhere for proper timezone handling
6. **Migrations**: Supabase CLI migrations, version-controlled SQL
7. **Security**: RLS enabled, policies defer to Phase 4

## References

- [Supabase Auth Schema](https://supabase.com/docs/guides/auth/managing-user-data)
- [Google Places API ToS](https://developers.google.com/maps/documentation/places/web-service/policies)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [PostgreSQL TIMESTAMPTZ](https://www.postgresql.org/docs/current/datatype-datetime.html)
