
-- Create a simple friends table for direct friend additions
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_user_id)
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Users can view their own friends
CREATE POLICY "Users can view their own friends" 
  ON public.friends 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can add friends
CREATE POLICY "Users can add friends" 
  ON public.friends 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can remove friends  
CREATE POLICY "Users can remove friends" 
  ON public.friends 
  FOR DELETE 
  USING (auth.uid() = user_id);
