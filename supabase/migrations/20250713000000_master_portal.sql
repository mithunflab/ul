
-- Master Portal Schema
-- This migration creates the necessary tables for the Master Portal functionality

-- Master users table for admin authentication
CREATE TABLE IF NOT EXISTS master_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global configuration table
CREATE TABLE IF NOT EXISTS global_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES master_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit packages table
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credits_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User credit transactions table
CREATE TABLE IF NOT EXISTS user_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  credits_amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT, -- For linking to purchases, workflows, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System audit logs
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Can be null for system actions
  master_user_id UUID REFERENCES master_users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub repositories management
CREATE TABLE IF NOT EXISTS github_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  access_token_encrypted TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  tags JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_credit_transactions_user_id ON user_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credit_transactions_created_at ON user_credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_created_at ON system_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_recorded_at ON system_health_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_github_repositories_user_id ON github_repositories(user_id);

-- Create RLS policies
ALTER TABLE master_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for master users (only accessible by authenticated master users)
CREATE POLICY "Master users can view all master users" ON master_users
  FOR SELECT USING (auth.jwt() ->> 'role' = 'master_admin');

CREATE POLICY "Master users can update master users" ON master_users
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'master_admin');

-- RLS Policies for global configuration
CREATE POLICY "Master users can manage global configuration" ON global_configuration
  FOR ALL USING (auth.jwt() ->> 'role' = 'master_admin');

-- RLS Policies for credit packages
CREATE POLICY "Everyone can view active credit packages" ON credit_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Master users can manage credit packages" ON credit_packages
  FOR ALL USING (auth.jwt() ->> 'role' = 'master_admin');

-- RLS Policies for user credit transactions
CREATE POLICY "Users can view their own credit transactions" ON user_credit_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Master users can view all credit transactions" ON user_credit_transactions
  FOR SELECT USING (auth.jwt() ->> 'role' = 'master_admin');

-- RLS Policies for system audit logs
CREATE POLICY "Master users can view audit logs" ON system_audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'master_admin');

-- RLS Policies for GitHub repositories
CREATE POLICY "Users can manage their own GitHub repositories" ON github_repositories
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Master users can view all GitHub repositories" ON github_repositories
  FOR SELECT USING (auth.jwt() ->> 'role' = 'master_admin');

-- RLS Policies for system health metrics
CREATE POLICY "Master users can view system health metrics" ON system_health_metrics
  FOR SELECT USING (auth.jwt() ->> 'role' = 'master_admin');

-- Insert default credit packages
INSERT INTO credit_packages (name, description, credits_amount, price_cents) VALUES
  ('Starter Pack', '100 credits for getting started', 100, 999),
  ('Professional Pack', '500 credits for regular users', 500, 4999),
  ('Enterprise Pack', '2000 credits for power users', 2000, 19999)
ON CONFLICT DO NOTHING;

-- Insert default configuration
INSERT INTO global_configuration (config_key, config_value, description) VALUES
  ('max_free_credits', '10', 'Maximum free credits for new users'),
  ('default_n8n_timeout', '300', 'Default timeout for n8n operations in seconds'),
  ('github_webhook_secret', '""', 'GitHub webhook secret for repository integration'),
  ('system_maintenance_mode', 'false', 'Whether the system is in maintenance mode')
ON CONFLICT (config_key) DO NOTHING;
