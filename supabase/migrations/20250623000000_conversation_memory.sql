-- Create conversation_memory table for storing Claude conversations with context and memory

CREATE TABLE IF NOT EXISTS conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context JSONB NOT NULL DEFAULT '{
    "active_workflows": [],
    "user_preferences": {},
    "recent_actions": []
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique combination of user_id and session_id
  UNIQUE(user_id, session_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversation_memory_user_session 
  ON conversation_memory(user_id, session_id);

CREATE INDEX IF NOT EXISTS idx_conversation_memory_updated_at 
  ON conversation_memory(updated_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE conversation_memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own conversation memory"
  ON conversation_memory
  FOR ALL
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_conversation_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_conversation_memory_updated_at_trigger
  BEFORE UPDATE ON conversation_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_memory_updated_at();

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_memory TO authenticated;
GRANT USAGE ON SEQUENCE conversation_memory_id_seq TO authenticated; 