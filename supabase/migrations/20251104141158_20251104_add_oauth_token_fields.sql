/*
  # Add OAuth Token Fields to social_accounts

  1. Changes
    - Add `refresh_token` column to store OAuth refresh tokens
    - Add `token_expires_at` column to track token expiration
    
  2. Security
    - refresh_token is nullable and stores sensitive OAuth data
    - token_expires_at helps manage token refresh logic
*/

-- Add refresh_token column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'social_accounts' AND column_name = 'refresh_token'
  ) THEN
    ALTER TABLE social_accounts ADD COLUMN refresh_token text;
  END IF;
END $$;

-- Add token_expires_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'social_accounts' AND column_name = 'token_expires_at'
  ) THEN
    ALTER TABLE social_accounts ADD COLUMN token_expires_at timestamptz;
  END IF;
END $$;