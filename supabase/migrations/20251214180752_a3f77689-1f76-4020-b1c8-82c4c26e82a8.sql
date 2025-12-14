-- Create analyses table to store user's startup idea analyses
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea TEXT NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own analyses
CREATE POLICY "Users can view own analyses"
ON public.analyses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own analyses
CREATE POLICY "Users can create own analyses"
ON public.analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses"
ON public.analyses
FOR DELETE
USING (auth.uid() = user_id);