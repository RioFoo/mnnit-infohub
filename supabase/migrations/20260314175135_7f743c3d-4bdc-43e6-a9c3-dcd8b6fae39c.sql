
-- 1. Fix profiles SELECT: require authenticated MNNIT email
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated MNNIT users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (right(auth.email(), 12) = '@mnnit.ac.in');

-- 2. Fix profiles INSERT: restrict branch/semester/role to server-set values only
-- Drop old permissive insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND right(auth.email(), 12) = '@mnnit.ac.in'
    AND role = 'Student'
    AND branch IN ('CSE', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'CSE-AI', 'IT', 'BT', 'MCA', 'MBA', 'PHD')
    AND semester IN ('1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th')
  );
