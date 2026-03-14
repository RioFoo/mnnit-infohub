
-- Fix 1: Lock branch, semester, and role from self-modification
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND branch = (SELECT branch FROM public.profiles WHERE id = auth.uid())
    AND semester = (SELECT semester FROM public.profiles WHERE id = auth.uid())
  );

-- Fix 2: Remove permissive avatar storage policies and keep only path-scoped ones
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Fix 3: Add domain check to can_view_resource
CREATE OR REPLACE FUNCTION public.can_view_resource(_resource_user_id uuid, _visibility text, _resource_branch text, _resource_semester text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT
    -- Must be MNNIT email
    right(auth.email(), 12) = '@mnnit.ac.in'
    AND (
      -- Owner always sees own resources
      _resource_user_id = auth.uid()
      -- Branch visibility
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
          ))
      -- Followers visibility
      OR (_visibility IN ('followers', 'both')
          AND EXISTS (
            SELECT 1 FROM followers
            WHERE follower_id = auth.uid()
            AND following_id = _resource_user_id
          ))
    )
$$;
