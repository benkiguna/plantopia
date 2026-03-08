-- Add push_subscription JSONB column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_subscription JSONB;
