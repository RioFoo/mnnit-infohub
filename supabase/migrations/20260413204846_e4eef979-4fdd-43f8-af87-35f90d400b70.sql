
-- Posts: allow public viewing
DROP POLICY IF EXISTS "Posts viewable by authenticated MNNIT users" ON public.posts;
CREATE POLICY "Posts viewable by everyone"
  ON public.posts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Comments: allow public viewing
DROP POLICY IF EXISTS "Comments viewable by authenticated MNNIT users" ON public.comments;
CREATE POLICY "Comments viewable by everyone"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (true);

-- Profiles: allow public viewing
DROP POLICY IF EXISTS "Profiles viewable by authenticated MNNIT users" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Reactions: allow public viewing
DROP POLICY IF EXISTS "Reactions viewable by authenticated MNNIT users" ON public.reactions;
CREATE POLICY "Reactions viewable by everyone"
  ON public.reactions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Likes: allow public viewing
DROP POLICY IF EXISTS "Likes viewable by authenticated MNNIT users" ON public.likes;
CREATE POLICY "Likes viewable by everyone"
  ON public.likes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Followers: allow public viewing
DROP POLICY IF EXISTS "Followers viewable by authenticated MNNIT users" ON public.followers;
CREATE POLICY "Followers viewable by everyone"
  ON public.followers FOR SELECT
  TO anon, authenticated
  USING (true);
