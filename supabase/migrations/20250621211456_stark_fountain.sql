/*
  # Create user_settings table

  1. New Tables
    - `user_settings`
      - `user_id` (uuid, primary key, references auth.users)
      - `email_notifications` (boolean, default true)
      - `workflow_notifications` (boolean, default true)
      - `marketing_emails` (boolean, default false)
      - `theme` (text, default 'dark')
      - `language` (text, default 'en')
      - `timezone` (text, default 'UTC')
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for authenticated users to read, update, and insert their own settings
*/

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email_notifications boolean DEFAULT true NOT NULL,
  workflow_notifications boolean DEFAULT true NOT NULL,
  marketing_emails boolean DEFAULT false NOT NULL,
  theme text DEFAULT 'dark' NOT NULL,
  language text DEFAULT 'en' NOT NULL,
  timezone text DEFAULT 'UTC' NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create a trigger to automatically create default settings when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();