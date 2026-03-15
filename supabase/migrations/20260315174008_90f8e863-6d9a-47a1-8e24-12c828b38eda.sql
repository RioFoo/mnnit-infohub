-- Fix 1: Remove the weak permissive avatar storage policies
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;

-- Ensure path-scoped INSERT policy exists for avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can upload own avatar'
  ) THEN
    CREATE POLICY "Users can upload own avatar" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Fix 2: Add domain enforcement to can_view_resource (already has it, but ensure consistency)
CREATE OR REPLACE FUNCTION public.can_view_resource(_resource_user_id uuid, _visibility text, _resource_branch text, _resource_semester text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT
    right(auth.email(), 12) = '@mnnit.ac.in'
    AND (
      _resource_user_id = auth.uid()
      OR (_visibility IN ('branch', 'both')
          AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND branch = _resource_branch
            AND semester = _resource_semester
          ))
      OR (_visibility IN ('branch', 'both')
          AND EXISTS (
            SELECT 1 FROM followers f
            JOIN profiles p ON p.id = f.follower_id
            WHERE f.follower_id = auth.uid()
            AND f.following_id = _resource_user_id
            AND p.branch = _resource_branch
            AND p.semester = _resource_semester
          ))
      OR (_visibility IN ('followers', 'both')
          AND EXISTS (
            SELECT 1 FROM followers
            WHERE follower_id = auth.uid()
            AND following_id = _resource_user_id
          ))
    )
$$;