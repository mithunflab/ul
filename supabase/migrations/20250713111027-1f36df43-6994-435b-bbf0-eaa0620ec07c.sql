
-- Create enum for credit types
CREATE TYPE public.credit_type AS ENUM ('ai', 'workflow');

-- Create user_credits table to track individual user credits
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ai_credits INTEGER DEFAULT 0 NOT NULL,
  workflow_credits INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create credit_transactions table to log all credit activities
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credit_type credit_type NOT NULL,
  amount INTEGER NOT NULL, -- positive for additions, negative for deductions
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('signup_bonus', 'admin_grant', 'chat_usage', 'workflow_usage', 'manual_adjustment')),
  description TEXT,
  reference_id TEXT, -- for linking to chat sessions, workflows, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create global_settings table for storing system-wide configurations
CREATE TABLE public.global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repositories table to track user repositories and workflows
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workflow_id TEXT NOT NULL,
  repository_name TEXT NOT NULL,
  github_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX idx_repositories_user_id ON public.repositories(user_id);
CREATE INDEX idx_repositories_workflow_id ON public.repositories(workflow_id);

-- Enable RLS on all tables
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own credits" ON public.user_credits
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Master users can view all credits" ON public.user_credits
  FOR SELECT USING (auth.jwt() ->> 'role' = 'master_admin');

CREATE POLICY "Master users can manage all credits" ON public.user_credits
  FOR ALL USING (auth.jwt() ->> 'role' = 'master_admin');

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Master users can view all transactions" ON public.credit_transactions
  FOR SELECT USING (auth.jwt() ->> 'role' = 'master_admin');

CREATE POLICY "System can insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for global_settings
CREATE POLICY "Master users can manage global settings" ON public.global_settings
  FOR ALL USING (auth.jwt() ->> 'role' = 'master_admin');

-- RLS Policies for repositories
CREATE POLICY "Users can view their own repositories" ON public.repositories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own repositories" ON public.repositories
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Master users can view all repositories" ON public.repositories
  FOR SELECT USING (auth.jwt() ->> 'role' = 'master_admin');

-- Function to initialize user credits on signup
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert initial credits for new user
  INSERT INTO public.user_credits (user_id, ai_credits, workflow_credits)
  VALUES (NEW.id, 50, 10);
  
  -- Log the signup bonus transactions
  INSERT INTO public.credit_transactions (user_id, credit_type, amount, transaction_type, description)
  VALUES 
    (NEW.id, 'ai', 50, 'signup_bonus', 'Initial AI credits on signup'),
    (NEW.id, 'workflow', 10, 'signup_bonus', 'Initial workflow credits on signup');
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize credits when user signs up
CREATE TRIGGER on_auth_user_created_initialize_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Function to deduct credits and log transaction
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_credit_type credit_type,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  IF p_credit_type = 'ai' THEN
    SELECT ai_credits INTO current_credits 
    FROM public.user_credits 
    WHERE user_id = p_user_id;
  ELSE
    SELECT workflow_credits INTO current_credits 
    FROM public.user_credits 
    WHERE user_id = p_user_id;
  END IF;
  
  -- Check if user has enough credits
  IF current_credits < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  IF p_credit_type = 'ai' THEN
    UPDATE public.user_credits 
    SET ai_credits = ai_credits - p_amount, updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_credits 
    SET workflow_credits = workflow_credits - p_amount, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (
    user_id, credit_type, amount, transaction_type, description, reference_id
  ) VALUES (
    p_user_id, p_credit_type, -p_amount, p_transaction_type, p_description, p_reference_id
  );
  
  RETURN TRUE;
END;
$$;

-- Function to add credits (for master portal)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_credit_type credit_type,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add credits
  IF p_credit_type = 'ai' THEN
    UPDATE public.user_credits 
    SET ai_credits = ai_credits + p_amount, updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_credits 
    SET workflow_credits = workflow_credits + p_amount, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Create user_credits record if it doesn't exist
  INSERT INTO public.user_credits (user_id, ai_credits, workflow_credits)
  VALUES (p_user_id, 
    CASE WHEN p_credit_type = 'ai' THEN p_amount ELSE 0 END,
    CASE WHEN p_credit_type = 'workflow' THEN p_amount ELSE 0 END
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (
    user_id, credit_type, amount, transaction_type, description
  ) VALUES (
    p_user_id, p_credit_type, p_amount, p_transaction_type, p_description
  );
  
  RETURN TRUE;
END;
$$;

-- Insert default global settings
INSERT INTO public.global_settings (setting_key, setting_value, description) VALUES
  ('n8n_url', '', 'Global n8n instance URL'),
  ('n8n_api_key', '', 'Global n8n API key'),
  ('github_access_token', '', 'Global GitHub access token for repository operations')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to get user credits
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS TABLE(ai_credits INTEGER, workflow_credits INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT uc.ai_credits, uc.workflow_credits
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;
END;
$$;
