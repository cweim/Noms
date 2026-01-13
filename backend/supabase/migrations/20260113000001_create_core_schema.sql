-- Core schema for Noms app
-- Phase 2: Database Schema

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Places table (cached Google Places data)
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  photo_reference TEXT,
  types TEXT[],
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_google_place_id CHECK (length(google_place_id) > 0)
);

-- Lists table (user-created themed collections)
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_list_name CHECK (length(trim(name)) > 0)
);

-- Saved places (many-to-many: users, places, lists)
-- list_id NULL = default "Saved" list
CREATE TABLE saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE SET NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id, list_id)
);

-- Journal entries (photo-first food memories)
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  note TEXT,
  eaten_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_photo_url CHECK (length(photo_url) > 0)
);

-- Comments for documentation
COMMENT ON TABLE users IS 'App user profiles extending Supabase auth.users';
COMMENT ON TABLE places IS 'Cached Google Places data with place_id for refresh';
COMMENT ON TABLE lists IS 'User-created themed restaurant collections';
COMMENT ON TABLE saved_places IS 'User saved places (list_id NULL = default Saved)';
COMMENT ON TABLE journal_entries IS 'Photo-first food journal with optional rating';
