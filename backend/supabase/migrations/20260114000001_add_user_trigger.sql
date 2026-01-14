-- Migration: Add user profile creation trigger
-- Phase 4: Authentication
-- Purpose: Auto-create profile in public.users when user signs up via Supabase Auth
--
-- When a user signs up through Supabase Auth (email/password or OAuth),
-- a record is created in auth.users. This trigger automatically creates
-- a corresponding profile record in public.users.
--
-- Without this trigger, authenticated users would have no profile record.

-- Function to handle new user signup
-- SECURITY DEFINER allows the function to insert into public.users
-- even though the auth trigger runs in a restricted context
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires after a new user is created in auth.users
-- This creates the corresponding profile in public.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Note: To remove this trigger if needed:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS handle_new_user();
