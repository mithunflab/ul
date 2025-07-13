-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'master', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create master_users table for master admin functionality
CREATE TABLE public.master_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'master' CHECK (role IN ('master', 'super_admin')),
  permissions JSONB DEFAULT '{"all": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mcp_servers table for MCP server management
CREATE TABLE public.mcp_servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  authorization_token TEXT,
  tool_configuration JSONB,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  last_health_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Master users can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.master_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Master users can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.master_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for master_users
CREATE POLICY "Master users can view all master users" ON public.master_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.master_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Master users can manage master users" ON public.master_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.master_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for mcp_servers
CREATE POLICY "Users can view their own servers" ON public.mcp_servers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own servers" ON public.mcp_servers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Master users can view all servers" ON public.mcp_servers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.master_users 
      WHERE user_id = auth.uid()
    )
  );

-- Function to initialize user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  
  -- Check if this is the master user email and add to master_users
  IF NEW.email = 'mithunkirish1008@gmail.com' THEN
    INSERT INTO public.master_users (user_id, email, full_name, role)
    VALUES (
      NEW.id, 
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'Master Admin'),
      'super_admin'
    );
    
    -- Update profile role for master user
    UPDATE public.profiles 
    SET role = 'super_admin' 
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the existing trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created_initialize_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_initialize_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Create new trigger for profile initialization
CREATE TRIGGER on_auth_user_created_handle_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if user is master
CREATE OR REPLACE FUNCTION public.is_master_user(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  check_email TEXT;
BEGIN
  -- Use provided email or get current user's email
  IF user_email IS NOT NULL THEN
    check_email := user_email;
  ELSE
    SELECT email INTO check_email 
    FROM auth.users 
    WHERE id = auth.uid();
  END IF;
  
  -- Check if user exists in master_users table
  RETURN EXISTS (
    SELECT 1 FROM public.master_users m
    JOIN auth.users u ON m.user_id = u.id
    WHERE u.email = check_email
  );
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_master_users_user_id ON public.master_users(user_id);
CREATE INDEX idx_master_users_email ON public.master_users(email);
CREATE INDEX idx_mcp_servers_user_id ON public.mcp_servers(user_id);
CREATE INDEX idx_mcp_servers_status ON public.mcp_servers(status);