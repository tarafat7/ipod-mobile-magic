
-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to clean up old daily submissions (older than today)
CREATE OR REPLACE FUNCTION public.cleanup_old_daily_submissions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete submissions older than today
  DELETE FROM public.daily_submissions 
  WHERE date < CURRENT_DATE;
  
  -- Log the cleanup for monitoring
  RAISE NOTICE 'Cleaned up old daily submissions at %', NOW();
END;
$$;

-- Schedule the cleanup job to run daily at 11:59 PM EST
-- Note: Supabase uses UTC, so 11:59 PM EST is 4:59 AM UTC (EST is UTC-5, EDT is UTC-4)
-- Using 4:59 AM UTC to handle EST (adjust to 3:59 AM UTC during EDT if needed)
SELECT cron.schedule(
  'daily-submissions-cleanup',
  '59 4 * * *', -- 4:59 AM UTC = 11:59 PM EST
  $$
  SELECT public.cleanup_old_daily_submissions();
  $$
);
