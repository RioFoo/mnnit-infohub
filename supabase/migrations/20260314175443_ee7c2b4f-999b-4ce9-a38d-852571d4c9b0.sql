
-- Restrict SELECT on posts to authenticated MNNIT users
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts viewable by authenticated MNNIT users"
  ON public.posts FOR SELECT TO authenticated
  USING (right(auth.email(), 12) = '@mnnit.ac.in');

-- Restrict SELECT on comments
DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.comments;
CREATE POLICY "Comments viewable by authenticated MNNIT users"
  ON public.comments FOR SELECT TO authenticated
  USING (right(auth.email(), 12) = '@mnnit.ac.in');

-- Restrict SELECT on likes
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
CREATE POLICY "Likes viewable by authenticated MNNIT users"
  ON public.likes FOR SELECT TO authenticated
  USING (right(auth.email(), 12) = '@mnnit.ac.in');

-- Restrict SELECT on reactions
DROP POLICY IF EXISTS "Reactions viewable by everyone" ON public.reactions;
CREATE POLICY "Reactions viewable by authenticated MNNIT users"
  ON public.reactions FOR SELECT TO authenticated
  USING (right(auth.email(), 12) = '@mnnit.ac.in');

-- Restrict SELECT on followers
DROP POLICY IF EXISTS "Anyone can view followers" ON public.followers;
CREATE POLICY "Followers viewable by authenticated MNNIT users"
  ON public.followers FOR SELECT TO authenticated
  USING (right(auth.email(), 12) = '@mnnit.ac.in');
