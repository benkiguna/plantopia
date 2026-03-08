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
