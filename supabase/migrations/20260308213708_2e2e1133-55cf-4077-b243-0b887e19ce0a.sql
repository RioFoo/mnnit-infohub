ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS semester text DEFAULT '2nd';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch text DEFAULT 'Batch 1';