-- 1. Tighten post-media bucket INSERT policy: enforce folder = auth.uid()
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND (qual LIKE '%post-media%' OR with_check LIKE '%post-media%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Post media is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

CREATE POLICY "Users can upload own post media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND right(auth.email(), 12) = '@mnnit.ac.in'
);

CREATE POLICY "Users can update own post media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own post media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Add UPDATE policy on resources bucket (owner-scoped)
CREATE POLICY "Users can update own resource files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resources'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'resources'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Realtime authorization: restrict channel subscriptions to user's own topic
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access own notification channel" ON realtime.messages;
CREATE POLICY "Users can only access own notification channel"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  -- Topic must equal the user's id, OR be a postgres_changes topic on their own row
  (realtime.topic() = auth.uid()::text)
  OR (realtime.topic() LIKE 'notifications:user_id=eq.' || auth.uid()::text)
  OR (realtime.topic() LIKE '%:' || auth.uid()::text)
);

-- 4. Revoke EXECUTE from anon/authenticated on internal trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.notify_followers_on_resource() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_followers_on_post() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_on_follow() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;