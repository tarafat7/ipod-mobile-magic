
-- Create a table to store user's five Spotify links
CREATE TABLE public.user_five_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  song_1 TEXT,
  song_2 TEXT,
  song_3 TEXT,
  song_4 TEXT,
  song_5 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_five_songs ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own songs
CREATE POLICY "Users can view their own five songs" 
  ON public.user_five_songs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own five songs" 
  ON public.user_five_songs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own five songs" 
  ON public.user_five_songs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own five songs" 
  ON public.user_five_songs 
  FOR DELETE 
  USING (auth.uid() = user_id);
