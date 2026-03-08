
-- Add favourite column to followers
ALTER TABLE public.followers ADD COLUMN favourite boolean NOT NULL DEFAULT false;

-- Allow users to update their own follow records (for toggling favourite)
CREATE POLICY "Users can update own follows" ON public.followers
FOR UPDATE USING (auth.uid() = follower_id)
WITH CHECK (auth.uid() = follower_id);

-- Create trigger function to notify followers when a new post is created
CREATE OR REPLACE FUNCTION public.notify_followers_on_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _follower record;
  _author_name text;
  _is_favourite boolean;
BEGIN
  -- Get author name
  SELECT name INTO _author_name FROM profiles WHERE id = NEW.user_id;
  
  -- Notify all followers
  FOR _follower IN
    SELECT follower_id, favourite FROM followers WHERE following_id = NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, message, type, link)
    VALUES (
      _follower.follower_id,
      COALESCE(_author_name, 'Someone') || ' shared a new post',
      CASE WHEN _follower.favourite THEN 'FAVOURITE_POST' ELSE 'FOLLOW_POST' END,
      '/'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to posts table
CREATE TRIGGER on_new_post_notify_followers
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.notify_followers_on_post();

-- Create trigger to notify user when someone follows them
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _follower_name text;
BEGIN
  SELECT name INTO _follower_name FROM profiles WHERE id = NEW.follower_id;
  
  INSERT INTO notifications (user_id, message, type, link)
  VALUES (
    NEW.following_id,
    COALESCE(_follower_name, 'Someone') || ' started following you',
    'FOLLOW',
    '/profile/' || NEW.follower_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_follow_notify
AFTER INSERT ON public.followers
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_follow();
