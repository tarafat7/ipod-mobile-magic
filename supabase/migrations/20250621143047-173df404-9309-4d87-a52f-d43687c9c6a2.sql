
-- Drop the current policy that might still be problematic
DROP POLICY IF EXISTS "Users can view daily submissions when they participated" ON public.daily_submissions;

-- Create a much simpler policy - users can see all submissions for today if they have submitted today
CREATE POLICY "Users can view todays submissions if they participated" 
  ON public.daily_submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.daily_submissions my_submission
      WHERE my_submission.user_id = auth.uid() 
      AND my_submission.date = CURRENT_DATE
    )
  );
