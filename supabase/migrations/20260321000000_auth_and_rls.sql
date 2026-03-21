-- PLANT-10: Real Supabase Auth integration
-- Applies: auto-create profile on sign-up
-- Deferred: RLS policies (requires data layer to use session client — see T-10 in APP_IMAGE.md)

-- Function to auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires after every new user in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- NOTE: RLS is intentionally NOT enabled here.
-- The data layer (lib/data/*.ts) uses createSimpleServerClient() which has no
-- user session, so auth.uid() would always be NULL and deny all queries.
-- User data isolation is enforced at the application layer (user_id filtering).
-- To enable RLS in the future, update lib/data/ to accept and use the SSR client
-- that carries the user's JWT, then uncomment the policies below.
--
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE health_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "profiles_self" ON profiles FOR ALL USING (auth.uid() = id);
-- CREATE POLICY "plants_owner" ON plants FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "health_entries_owner" ON health_entries FOR ALL USING (
--   EXISTS (SELECT 1 FROM plants WHERE plants.id = health_entries.plant_id AND plants.user_id = auth.uid())
-- );
-- CREATE POLICY "care_logs_owner" ON care_logs FOR ALL USING (
--   EXISTS (SELECT 1 FROM plants WHERE plants.id = care_logs.plant_id AND plants.user_id = auth.uid())
-- );
