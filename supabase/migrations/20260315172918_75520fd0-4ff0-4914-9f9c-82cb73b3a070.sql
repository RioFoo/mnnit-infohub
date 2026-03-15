
-- Fix 1: Add semester check to follower branch-visibility in can_view_resource
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

-- Fix 2: Remove client-side INSERT policy on notifications, replace with service_role only
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
