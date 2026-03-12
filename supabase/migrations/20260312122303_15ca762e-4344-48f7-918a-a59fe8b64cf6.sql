-- Trigger to notify followers when a user uploads a resource
CREATE OR REPLACE FUNCTION public.notify_followers_on_resource()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  _follower record;
  _uploader_name text;
BEGIN
  SELECT name INTO _uploader_name FROM profiles WHERE id = NEW.user_id;
  
  FOR _follower IN
    SELECT follower_id FROM followers WHERE following_id = NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, message, type, link)
    VALUES (
      _follower.follower_id,
      COALESCE(_uploader_name, 'Someone') || ' uploaded "' || NEW.title || '" to their library',
      'RESOURCE_UPLOAD',
      '/resources'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_resource_upload
  AFTER INSERT ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_followers_on_resource();