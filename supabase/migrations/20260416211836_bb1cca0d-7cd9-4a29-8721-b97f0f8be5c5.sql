-- 1. Fix resources storage bucket: remove public read policy
DROP POLICY IF EXISTS "Anyone can read resources" ON storage.objects;
DROP POLICY IF EXISTS "Public can read resources" ON storage.objects;
DROP POLICY IF EXISTS "Resources publicly readable" ON storage.objects;

-- Replace with: only authenticated MNNIT users may read, AND only resources they're allowed to see per can_view_resource()
CREATE POLICY "Authenticated MNNIT users can read allowed resources"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resources'
  AND right(auth.email(), 12) = '@mnnit.ac.in'
  AND EXISTS (
    SELECT 1 FROM public.resources r
    WHERE r.file_url = storage.objects.name
      AND public.can_view_resource(r.user_id, r.visibility, r.branch, r.semester)
  )
);

-- 2. Hide sensitive profile columns from anonymous (signed-out) visitors.
--    Anon users keep access to non-sensitive columns; authenticated users keep full access.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, name, handle, avatar_url, bio, role, branch, section,
  created_at, updated_at, semester, batch, banner_url, skills,
  default_resource_visibility
) ON public.profiles TO anon;
-- Note: gender and github_url are intentionally NOT granted to anon.
-- Authenticated users retain full access (granted by default to authenticated role).
GRANT SELECT ON public.profiles TO authenticated;