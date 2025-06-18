
-- First, drop the existing foreign key constraint
ALTER TABLE public.user_five_songs 
DROP CONSTRAINT IF EXISTS user_five_songs_user_id_fkey;

-- Add the constraint back with CASCADE DELETE
ALTER TABLE public.user_five_songs 
ADD CONSTRAINT user_five_songs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
