
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Only participants can view submissions" ON public.daily_submissions;

-- Create a simpler, non-recursive policy for viewing submissions
-- Users can see submissions for days when they have also submitted
CREATE POLICY "Users can view daily submissions when they participated" 
  ON public.daily_submissions 
  FOR SELECT 
  USING (
    date IN (
      SELECT DISTINCT date 
      FROM public.daily_submissions 
      WHERE user_id = auth.uid()
    )
  );

-- Also ensure users can still insert their own submissions
DROP POLICY IF EXISTS "Users can submit songs" ON public.daily_submissions;
CREATE POLICY "Users can submit songs" 
  ON public.daily_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
