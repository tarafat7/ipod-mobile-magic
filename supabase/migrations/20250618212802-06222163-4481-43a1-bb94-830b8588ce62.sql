
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own five songs" ON public.user_five_songs;
DROP POLICY IF EXISTS "Users can insert their own five songs" ON public.user_five_songs;
DROP POLICY IF EXISTS "Users can update their own five songs" ON public.user_five_songs;
DROP POLICY IF EXISTS "Users can delete their own five songs" ON public.user_five_songs;

-- Make user_five_songs table publicly readable so shared links work
ALTER TABLE public.user_five_songs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read user_five_songs (for sharing functionality)
CREATE POLICY "Anyone can view user_five_songs" 
  ON public.user_five_songs 
  FOR SELECT 
  USING (true);

-- Allow users to insert their own songs (authenticated users only)
CREATE POLICY "Users can create their own songs" 
  ON public.user_five_songs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own songs (authenticated users only)
CREATE POLICY "Users can update their own songs" 
  ON public.user_five_songs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own songs (authenticated users only)
CREATE POLICY "Users can delete their own songs" 
  ON public.user_five_songs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Make profiles table publicly readable so shared links show names
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles (for sharing functionality)
CREATE POLICY "Anyone can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow users to update their own profile (authenticated users only)
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to insert their own profile (authenticated users only)
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
