
-- 1. Followers table
CREATE TABLE public.followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view followers" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- 2. Add visibility column to resources
ALTER TABLE public.resources ADD COLUMN visibility text NOT NULL DEFAULT 'branch';

-- 3. Add default resource visibility to profiles
ALTER TABLE public.profiles ADD COLUMN default_resource_visibility text DEFAULT 'branch';

-- 4. Create security definer function for resource visibility check
CREATE OR REPLACE FUNCTION public.can_view_resource(
  _resource_user_id uuid,
  _visibility text,
  _resource_branch text,
  _resource_semester text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Owner always sees own resources
    _resource_user_id = auth.uid()
    -- Branch visibility: viewer has same branch AND semester
    OR (_visibility IN ('branch', 'both')
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND branch = _resource_branch
          AND semester = _resource_semester
        ))
    -- Followers visibility: viewer follows the uploader
    OR (_visibility IN ('followers', 'both')
        AND EXISTS (
          SELECT 1 FROM followers
          WHERE follower_id = auth.uid()
          AND following_id = _resource_user_id
        ))
$$;

-- 5. Drop old SELECT policy and create new one
DROP POLICY "Resources viewable by everyone" ON public.resources;

CREATE POLICY "Resources viewable based on visibility" ON public.resources
FOR SELECT USING (
  public.can_view_resource(user_id, visibility, branch, semester)
);
