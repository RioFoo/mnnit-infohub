
CREATE OR REPLACE FUNCTION public.email_for_recovery(_recovery text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM auth.users
  WHERE lower(raw_user_meta_data->>'recovery_email') = lower(_recovery)
  ORDER BY created_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.email_for_recovery(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_for_recovery(text) TO anon, authenticated;
