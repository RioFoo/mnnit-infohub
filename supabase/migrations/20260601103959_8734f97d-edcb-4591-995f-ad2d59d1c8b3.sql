-- Fix 1: Restrict resources bucket uploads to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Users upload resources to own folder" ON storage.objects;

CREATE POLICY "Users upload resources to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resources'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND right(auth.email(), 12) = '@mnnit.ac.in'
);

-- Also restrict UPDATE and DELETE on own folder for resources bucket
DROP POLICY IF EXISTS "Users update own resources files" ON storage.objects;
CREATE POLICY "Users update own resources files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own resources files" ON storage.objects;
CREATE POLICY "Users delete own resources files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix 2: Simplify can_view_resource — remove redundant follower+branch clause
-- so that 'both' visibility correctly grants access to all same-branch users
-- OR to any follower (regardless of branch).
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