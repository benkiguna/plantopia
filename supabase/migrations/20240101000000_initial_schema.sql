-- Plantopia Initial Schema
-- Phase 2: Database tables without RLS (auth skipped for now)

-- Species lookup table (reference data)
CREATE TABLE species (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  water_days INTEGER NOT NULL DEFAULT 7,
  light TEXT NOT NULL DEFAULT 'bright_indirect',
  humidity TEXT NOT NULL DEFAULT 'medium',
  fertilize_days INTEGER NOT NULL DEFAULT 30,
  tip TEXT
);

-- User profiles (simplified, no auth for now)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plants owned by users
CREATE TABLE plants (
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
CREATE TABLE health_entries (
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
CREATE TABLE care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_plants_species_key ON plants(species_key);
CREATE INDEX idx_health_entries_plant_id ON health_entries(plant_id);
CREATE INDEX idx_health_entries_created_at ON health_entries(created_at DESC);
CREATE INDEX idx_care_logs_plant_id ON care_logs(plant_id);
CREATE INDEX idx_care_logs_created_at ON care_logs(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to plants table
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
