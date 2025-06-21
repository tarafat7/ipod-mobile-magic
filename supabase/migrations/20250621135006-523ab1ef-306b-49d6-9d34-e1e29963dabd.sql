
-- Simple prompts table with order
CREATE TABLE public.daily_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_text TEXT NOT NULL,
  order_position INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Simple submissions table
CREATE TABLE public.daily_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_art TEXT,
  spotify_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date) -- One submission per user per day
);

-- Enable RLS
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can see prompts
CREATE POLICY "Anyone can view prompts" 
  ON public.daily_prompts 
  FOR SELECT 
  TO PUBLIC
  USING (true);

-- Only participants can see submissions for that day
CREATE POLICY "Only participants can view submissions" 
  ON public.daily_submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.daily_submissions user_sub
      WHERE user_sub.user_id = auth.uid() 
      AND user_sub.date = daily_submissions.date
    )
  );

-- Users can submit their own songs
CREATE POLICY "Users can submit songs" 
  ON public.daily_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add some sample prompts
INSERT INTO public.daily_prompts (prompt_text, order_position) VALUES
('Songs that played during the best week of your life', 1),
('Tracks that make you feel invincible', 2),
('Music you''d play on a road trip at 3am', 3),
('Songs that instantly transport you to another time', 4),
('Tracks that give you goosebumps every time', 5);

-- Simple function to get today's prompt (cycles through the list)
CREATE OR REPLACE FUNCTION get_todays_prompt()
RETURNS TABLE(prompt_text TEXT) AS $$
DECLARE
  total_prompts INTEGER;
  days_since_epoch INTEGER;
  prompt_index INTEGER;
BEGIN
  -- Count total prompts
  SELECT COUNT(*) INTO total_prompts FROM daily_prompts;
  
  -- Calculate days since epoch (Jan 1, 1970)
  SELECT EXTRACT(EPOCH FROM CURRENT_DATE) / 86400 INTO days_since_epoch;
  
  -- Calculate which prompt to show (cycles through 1 to total_prompts)
  prompt_index := (days_since_epoch % total_prompts) + 1;
  
  -- Return the prompt
  RETURN QUERY
  SELECT dp.prompt_text
  FROM daily_prompts dp
  WHERE dp.order_position = prompt_index;
END;
$$ LANGUAGE plpgsql;
