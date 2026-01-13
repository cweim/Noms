-- Row Level Security policies
-- Phase 2: Database Schema (Plan 2)

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users are created via trigger on auth.users insert (handled by Supabase Auth)
-- No INSERT policy needed here

-- ============================================
-- PLACES TABLE POLICIES
-- ============================================

-- Anyone can read places (they're cached public data from Google)
CREATE POLICY "Anyone can read places"
  ON places FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update places (API backend does this)
-- No user-facing policy needed

-- ============================================
-- LISTS TABLE POLICIES
-- ============================================

-- Users can read their own lists
CREATE POLICY "Users can read own lists"
  ON lists FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own lists
CREATE POLICY "Users can create own lists"
  ON lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own lists
CREATE POLICY "Users can update own lists"
  ON lists FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own lists
CREATE POLICY "Users can delete own lists"
  ON lists FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SAVED PLACES TABLE POLICIES
-- ============================================

-- Users can read their own saved places
CREATE POLICY "Users can read own saves"
  ON saved_places FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save places
CREATE POLICY "Users can save places"
  ON saved_places FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own saves (e.g., move to different list)
CREATE POLICY "Users can update own saves"
  ON saved_places FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own saves
CREATE POLICY "Users can delete own saves"
  ON saved_places FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- JOURNAL ENTRIES TABLE POLICIES
-- ============================================

-- Users can read their own journal entries
CREATE POLICY "Users can read own journal"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create journal entries
CREATE POLICY "Users can create journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries
CREATE POLICY "Users can update own journal"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own journal entries
CREATE POLICY "Users can delete own journal"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON POLICY "Users can read own profile" ON users IS 'User data isolation';
COMMENT ON POLICY "Anyone can read places" ON places IS 'Places are public cached data';
COMMENT ON POLICY "Users can read own journal" ON journal_entries IS 'Journal privacy';
