
-- Insert default master user
-- Password: admin123 (in production, this should be properly hashed)
INSERT INTO master_users (email, password_hash, full_name, role, is_active) VALUES
  ('admin@company.com', 'admin123', 'System Administrator', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;
