/*
  # Create n8n connections table

  1. New Tables
    - `n8n_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `instance_name` (text, user-friendly name)
      - `base_url` (text, n8n instance URL)
      - `api_key` (text, encrypted API key)
      - `is_active` (boolean, default true)
      - `last_connected` (timestamptz)
      - `connection_status` (text, enum: 'connected', 'disconnected', 'error')
      - `version` (text, n8n version)
      - `workflow_count` (integer, default 0)
      - `execution_count` (integer, default 0)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `n8n_connections` table
    - Add policies for authenticated users to manage their own connections
*/

CREATE TABLE IF NOT EXISTS public.n8n_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instance_name text NOT NULL,
  base_url text NOT NULL,
  api_key text NOT NULL, -- Will be encrypted in production
  is_active boolean DEFAULT true NOT NULL,
  last_connected timestamptz,
  connection_status text DEFAULT 'disconnected' NOT NULL,
  version text,
  workflow_count integer DEFAULT 0,
  execution_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_connection_status CHECK (connection_status IN ('connected', 'disconnected', 'error'))
);

ALTER TABLE public.n8n_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own n8n connections"
  ON public.n8n_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own n8n connections"
  ON public.n8n_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own n8n connections"
  ON public.n8n_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own n8n connections"
  ON public.n8n_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_n8n_connections_user_id ON public.n8n_connections(user_id);
CREATE INDEX idx_n8n_connections_active ON public.n8n_connections(user_id, is_active) WHERE is_active = true;