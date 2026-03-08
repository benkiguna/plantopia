-- Plantopia Database Setup Script
-- Run this in the Supabase SQL Editor if `npx supabase db push` isn't working

-- ============================================
-- PART 1: Create Tables
-- ============================================

-- Species lookup table (reference data)
CREATE TABLE IF NOT EXISTS species (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  water_days INTEGER NOT NULL DEFAULT 7,
  light TEXT NOT NULL DEFAULT 'bright_indirect',
  humidity TEXT NOT NULL DEFAULT 'medium',
  fertilize_days INTEGER NOT NULL DEFAULT 30,
  tip TEXT
);

-- User profiles (simplified, no auth for now)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plants owned by users
CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  species_key TEXT REFERENCES species(key),
  nickname TEXT NOT NULL,
  light_setup TEXT NOT NULL DEFAULT 'bright_indirect',
  pot_size TEXT,
  soil_type TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Health check entries with AI analysis
CREATE TABLE IF NOT EXISTS health_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  ai_notes TEXT,
  issues JSONB DEFAULT '[]',
  user_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Care activity logs
CREATE TABLE IF NOT EXISTS care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PART 2: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_species_key ON plants(species_key);
CREATE INDEX IF NOT EXISTS idx_health_entries_plant_id ON health_entries(plant_id);
CREATE INDEX IF NOT EXISTS idx_health_entries_created_at ON health_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_care_logs_plant_id ON care_logs(plant_id);
CREATE INDEX IF NOT EXISTS idx_care_logs_created_at ON care_logs(created_at DESC);

-- ============================================
-- PART 3: Create Trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 4: Seed Species Data
-- ============================================

INSERT INTO species (key, name, water_days, light, humidity, fertilize_days, tip) VALUES
  ('monstera_deliciosa', 'Monstera Deliciosa', 7, 'bright_indirect', 'high', 30, 'Wipe leaves monthly to remove dust and help photosynthesis.'),
  ('pothos', 'Golden Pothos', 10, 'low_to_bright_indirect', 'medium', 60, 'Trim regularly to encourage bushier growth.'),
  ('snake_plant', 'Snake Plant', 14, 'low_to_bright', 'low', 60, 'One of the most forgiving plants - perfect for beginners.'),
  ('fiddle_leaf_fig', 'Fiddle Leaf Fig', 7, 'bright_indirect', 'medium', 30, 'Rotate weekly for even growth. Avoid moving it frequently.'),
  ('peace_lily', 'Peace Lily', 7, 'low_to_medium', 'high', 45, 'Droopy leaves mean it needs water - it will perk back up quickly.'),
  ('rubber_plant', 'Rubber Plant', 10, 'bright_indirect', 'medium', 30, 'Clean leaves with a damp cloth to keep them shiny.'),
  ('zz_plant', 'ZZ Plant', 21, 'low_to_bright_indirect', 'low', 90, 'Extremely drought tolerant - when in doubt, don''t water.'),
  ('spider_plant', 'Spider Plant', 7, 'bright_indirect', 'medium', 30, 'Produces baby plants (spiderettes) that can be propagated.'),
  ('philodendron', 'Philodendron', 7, 'medium_to_bright_indirect', 'medium', 30, 'Yellow leaves often indicate overwatering.'),
  ('calathea', 'Calathea', 5, 'medium_indirect', 'high', 30, 'Use filtered or distilled water - sensitive to chemicals in tap water.')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- PART 5: Create Mock User for Development
-- ============================================

INSERT INTO profiles (id, email, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'dev@plantopia.local', 'Dev User')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 6: Add Light Analysis Columns
-- ============================================

ALTER TABLE plants
ADD COLUMN IF NOT EXISTS light_photo_url TEXT,
ADD COLUMN IF NOT EXISTS light_analysis JSONB;

COMMENT ON COLUMN plants.light_analysis IS 'JSON structure: { light_level, light_source, estimated_daily_hours, notes, confidence }';

-- ============================================
-- PART 7: Setup Storage Bucket for Plant Photos
-- ============================================

-- Create storage bucket for plant photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-photos',
  'plant-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for plant photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to plant-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to plant-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from plant-photos" ON storage.objects;

-- Allow public read access to plant photos
CREATE POLICY "Public read access for plant photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'plant-photos');

-- Allow anyone to upload plant photos (for development without auth)
CREATE POLICY "Allow uploads to plant-photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'plant-photos');

-- Allow anyone to update photos (for development without auth)
CREATE POLICY "Allow updates to plant-photos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'plant-photos');

-- Allow anyone to delete photos (for development without auth)
CREATE POLICY "Allow deletes from plant-photos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'plant-photos');

-- ============================================
-- Done! Your database is ready.
-- ============================================
