-- Add detailed analysis column to health_entries
ALTER TABLE health_entries
ADD COLUMN IF NOT EXISTS analysis JSONB;

COMMENT ON COLUMN health_entries.analysis IS 'Detailed AI health analysis with dimension scores, positive signs, concerns, and summary';
