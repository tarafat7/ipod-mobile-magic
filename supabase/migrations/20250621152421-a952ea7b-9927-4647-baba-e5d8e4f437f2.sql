
-- Drop the existing unique constraint that limits one submission per user per day
ALTER TABLE public.daily_submissions DROP CONSTRAINT IF EXISTS daily_submissions_user_id_date_key;

-- Add a position field to track which of the 5 songs this is (1-5)
ALTER TABLE public.daily_submissions ADD COLUMN position INTEGER DEFAULT 1;

-- Add constraint to ensure position is between 1 and 5
ALTER TABLE public.daily_submissions ADD CONSTRAINT position_range CHECK (position >= 1 AND position <= 5);

-- Create new unique constraint allowing up to 5 submissions per user per day
ALTER TABLE public.daily_submissions ADD CONSTRAINT daily_submissions_user_date_position_unique UNIQUE (user_id, date, position);

-- Update the RLS policy to allow users to update and delete their own submissions
CREATE POLICY "Users can update their own submissions" 
  ON public.daily_submissions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions" 
  ON public.daily_submissions 
  FOR DELETE 
  USING (auth.uid() = user_id);
