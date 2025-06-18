
-- First, delete all objects in the profile-pictures bucket
DELETE FROM storage.objects WHERE bucket_id = 'profile-pictures';

-- Then delete the bucket
DELETE FROM storage.buckets WHERE id = 'profile-pictures';

-- Drop the storage policies
DROP POLICY IF EXISTS "Users can upload their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;

-- Remove profile picture column from profiles table
ALTER TABLE public.profiles DROP COLUMN profile_picture_url;

-- Update the handle_new_user function to exclude profile picture URL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;
