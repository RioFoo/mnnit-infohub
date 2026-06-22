
-- Tighten avatar upload to MNNIT users only
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND right(auth.email(), 12) = '@mnnit.ac.in'
);

-- Restrict resources.visibility to known values
ALTER TABLE public.resources
  ADD CONSTRAINT resources_visibility_check
  CHECK (visibility IN ('branch','followers','both','public'));

-- Update can_view_resource to handle 'public' visibility
CREATE OR REPLACE FUNCTION public.can_view_resource(_resource_user_id uuid, _visibility text, _resource_branch text, _resource_semester text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    right(auth.email(), 12) = '@mnnit.ac.in'
    AND (
      _resource_user_id = auth.uid()
      OR _visibility = 'public'
      OR (_visibility IN ('branch', 'both')
          AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND branch = _resource_branch
            AND semester = _resource_semester
          ))
      OR (_visibility IN ('followers', 'both')
          AND EXISTS (
            SELECT 1 FROM followers
            WHERE follower_id = auth.uid()
            AND following_id = _resource_user_id
          ))
    )
$function$;
