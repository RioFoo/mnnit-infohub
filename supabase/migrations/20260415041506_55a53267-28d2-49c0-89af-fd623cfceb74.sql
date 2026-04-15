-- Add github_url and skills columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}'::text[];