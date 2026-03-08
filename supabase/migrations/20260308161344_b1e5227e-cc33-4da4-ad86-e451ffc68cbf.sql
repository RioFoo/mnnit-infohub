
-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resources', 'resources', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Allow everyone to read resources
CREATE POLICY "Anyone can read resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own resources"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create resources table to track uploads
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  branch text DEFAULT 'All',
  semester text DEFAULT '1st',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploader_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources viewable by everyone"
ON public.resources FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can upload"
ON public.resources FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources"
ON public.resources FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
