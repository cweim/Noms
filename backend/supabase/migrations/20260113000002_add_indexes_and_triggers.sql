-- Performance indexes and triggers
-- Phase 2: Database Schema (Plan 2)

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Saved places queries (most common: "show me my saved places")
CREATE INDEX idx_saved_places_user ON saved_places(user_id);
CREATE INDEX idx_saved_places_user_list ON saved_places(user_id, list_id);
CREATE INDEX idx_saved_places_place ON saved_places(place_id);
CREATE INDEX idx_saved_places_list ON saved_places(list_id) WHERE list_id IS NOT NULL;

-- Journal queries (common: "show my journal", "journal for this place")
CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_user_date ON journal_entries(user_id, eaten_at DESC);
CREATE INDEX idx_journal_place ON journal_entries(place_id) WHERE place_id IS NOT NULL;

-- Lists queries
CREATE INDEX idx_lists_user ON lists(user_id);

-- Places lookup by Google ID (when fetching from API)
CREATE INDEX idx_places_google_id ON places(google_place_id);

-- Places cache freshness (when determining if refresh needed)
CREATE INDEX idx_places_last_fetched ON places(last_fetched_at) WHERE last_fetched_at IS NOT NULL;

-- ============================================
-- AUTOMATED TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON INDEX idx_saved_places_user IS 'Fast lookup of user saved places';
COMMENT ON INDEX idx_journal_user_date IS 'Chronological journal queries';
COMMENT ON INDEX idx_places_google_id IS 'Place lookup by Google Place ID';
COMMENT ON FUNCTION update_updated_at IS 'Auto-update updated_at on row modification';
