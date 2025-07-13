
-- Create master portal configuration tables

-- Global n8n configuration
CREATE TABLE master_n8n_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  global_url TEXT,
  global_api_key TEXT,
  is_enabled BOOLEAN DEFAULT false,
  last_tested TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'disconnected',
  version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Global GitHub configuration
CREATE TABLE master_github_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  global_access_token TEXT,
  organization TEXT,
  repository_prefix TEXT DEFAULT 'workflow-',
  auto_commit BOOLEAN DEFAULT true,
  default_branch TEXT DEFAULT 'main',
  is_enabled BOOLEAN DEFAULT false,
  last_tested TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'disconnected',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User credits tracking
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_credits INTEGER DEFAULT 0,
  workflow_credits INTEGER DEFAULT 0,
  total_used_ai INTEGER DEFAULT 0,
  total_used_workflows INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Audit logs for master portal
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  details TEXT,
  ip_address INET,
  user_agent TEXT,
  severity TEXT DEFAULT 'low',
  category TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- System settings
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Workflow repository tracking
CREATE TABLE workflow_repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id TEXT,
  repository_name TEXT,
  repository_url TEXT,
  github_id TEXT,
  last_commit_sha TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_workflow_repositories_user_id ON workflow_repositories(user_id);
CREATE INDEX idx_workflow_repositories_workflow_id ON workflow_repositories(workflow_id);

-- Enable RLS on all tables
ALTER TABLE master_n8n_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_github_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_repositories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin access only for master portal tables)
-- For now, allow authenticated users to read their own data
-- Later, you should implement proper admin role checking

CREATE POLICY "Users can read their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own repositories" ON workflow_repositories
  FOR SELECT USING (auth.uid() = user_id);

-- Admin-only policies for master tables (you'll need to implement proper admin role checking)
CREATE POLICY "Admin access to n8n config" ON master_n8n_config
  FOR ALL USING (true); -- Replace with proper admin check

CREATE POLICY "Admin access to github config" ON master_github_config
  FOR ALL USING (true); -- Replace with proper admin check

CREATE POLICY "Admin access to audit logs" ON audit_logs
  FOR ALL USING (true); -- Replace with proper admin check

CREATE POLICY "Admin access to system settings" ON system_settings
  FOR ALL USING (true); -- Replace with proper admin check

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('debug_mode', 'false', 'Enable debug logging'),
  ('log_level', '"info"', 'System log level'),
  ('max_concurrent_workflows', '100', 'Maximum concurrent workflows'),
  ('session_timeout', '24', 'Session timeout in hours'),
  ('max_login_attempts', '5', 'Maximum login attempts before lockout'),
  ('require_email_verification', 'true', 'Require email verification for new users'),
  ('enable_two_factor', 'false', 'Enable two-factor authentication requirement');

-- Function to initialize user credits when a user is created
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, ai_credits, workflow_credits)
  VALUES (NEW.id, 100, 5); -- Default credits for new users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create credits for new users
DROP TRIGGER IF EXISTS trigger_initialize_user_credits ON auth.users;
CREATE TRIGGER trigger_initialize_user_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_credits();

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_user_email TEXT,
  p_action TEXT,
  p_resource TEXT DEFAULT NULL,
  p_details TEXT DEFAULT NULL,  
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'low',
  p_category TEXT DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, user_email, action, resource, details, 
    ip_address, user_agent, severity, category
  ) VALUES (
    p_user_id, p_user_email, p_action, p_resource, p_details,
    p_ip_address, p_user_agent, p_severity, p_category
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
