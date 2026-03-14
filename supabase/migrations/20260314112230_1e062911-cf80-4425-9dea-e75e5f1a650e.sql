
CREATE TRIGGER on_post_create
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_followers_on_post();

CREATE TRIGGER on_follow
  AFTER INSERT ON public.followers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_follow();
