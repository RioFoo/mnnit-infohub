CREATE OR REPLACE FUNCTION public.can_view_resource(_resource_user_id uuid, _visibility text, _resource_branch text, _resource_semester text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT
    -- Owner always sees own resources
    _resource_user_id = auth.uid()
    -- Branch visibility: viewer has same branch AND semester, OR is a follower with same branch
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
    -- Followers visibility: viewer follows the uploader
    OR (_visibility IN ('followers', 'both')
        AND EXISTS (
          SELECT 1 FROM followers
          WHERE follower_id = auth.uid()
          AND following_id = _resource_user_id
        ))
$$;