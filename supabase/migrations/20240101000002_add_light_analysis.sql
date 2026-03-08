-- Add light analysis columns to plants table
ALTER TABLE plants
ADD COLUMN light_photo_url TEXT,
ADD COLUMN light_analysis JSONB;

-- Add comment explaining the light_analysis structure
COMMENT ON COLUMN plants.light_analysis IS 'JSON structure: { light_level, light_source, estimated_daily_hours, notes, confidence }';
