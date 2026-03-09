-- 1. Make resources bucket private
UPDATE storage.buckets SET public = false WHERE id = 'resources';

-- 2. Add email domain enforcement to write RLS policies
-- Posts: only @mnnit.ac.in users can create
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND right(auth.email(), 12) = '@mnnit.ac.in');

-- Comments: only @mnnit.ac.in users can comment
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.comments;
CREATE POLICY "Authenticated users can comment"
ON public.comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND right(auth.email(), 12) = '@mnnit.ac.in');

-- Followers: only @mnnit.ac.in users can follow
DROP POLICY IF EXISTS "Users can follow" ON public.followers;
CREATE POLICY "Users can follow"
ON public.followers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id AND right(auth.email(), 12) = '@mnnit.ac.in');

-- Resources: only @mnnit.ac.in users can upload
DROP POLICY IF EXISTS "Authenticated users can upload" ON public.resources;
CREATE POLICY "Authenticated users can upload"
ON public.resources FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND right(auth.email(), 12) = '@mnnit.ac.in');

-- Likes: only @mnnit.ac.in users can like
DROP POLICY IF EXISTS "Authenticated users can like" ON public.likes;
CREATE POLICY "Authenticated users can like"
ON public.likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND right(auth.email(), 12) = '@mnnit.ac.in');

-- Reactions: only @mnnit.ac.in users can react
DROP POLICY IF EXISTS "Authenticated users can react" ON public.reactions;
CREATE POLICY "Authenticated users can react"
ON public.reactions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND right(auth.email(), 12) = '@mnnit.ac.in');