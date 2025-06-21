
-- First, drop the problematic policy
DROP POLICY IF EXISTS "Users can view todays submissions if they participated" ON public.daily_submissions;

-- Create a security definer function to check if user has submitted today
CREATE OR REPLACE FUNCTION public.user_has_submitted_today()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.daily_submissions 
    WHERE user_id = auth.uid() 
    AND date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a new, non-recursive policy using the function
CREATE POLICY "Users can view submissions if they participated today" 
  ON public.daily_submissions 
  FOR SELECT 
  USING (public.user_has_submitted_today());
