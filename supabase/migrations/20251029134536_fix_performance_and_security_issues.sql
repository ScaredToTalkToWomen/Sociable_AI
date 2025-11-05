/*
  # Fix Performance and Security Issues

  ## Changes Made

  1. **Add Missing Indexes on Foreign Keys**
     - Add index on `ai_suggestions.user_id`
     - Add index on `analytics_data.post_id`
     - Add index on `analytics_data.user_id`
     - Add index on `content_posts.user_id`
     - Add index on `social_accounts.user_id`

  2. **Optimize RLS Policies**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This prevents re-evaluation of auth function for each row
     - Significantly improves query performance at scale

  3. **Fix Function Search Path**
     - Add explicit schema qualification to `handle_new_user` function
     - Set stable search_path for security

  ## Security Notes
  - All indexes improve query performance for foreign key lookups
  - RLS policy optimization reduces CPU usage during queries
  - Function search path fix prevents potential security vulnerabilities
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

-- Index for ai_suggestions foreign key
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id 
  ON public.ai_suggestions(user_id);

-- Indexes for analytics_data foreign keys
CREATE INDEX IF NOT EXISTS idx_analytics_data_user_id 
  ON public.analytics_data(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_data_post_id 
  ON public.analytics_data(post_id);

-- Index for content_posts foreign key
CREATE INDEX IF NOT EXISTS idx_content_posts_user_id 
  ON public.content_posts(user_id);

-- Index for social_accounts foreign key
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id 
  ON public.social_accounts(user_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - PROFILES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES - SOCIAL_ACCOUNTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can insert own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can update own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can delete own social accounts" ON public.social_accounts;

CREATE POLICY "Users can read own social accounts"
  ON public.social_accounts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own social accounts"
  ON public.social_accounts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own social accounts"
  ON public.social_accounts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON public.social_accounts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - CONTENT_POSTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.content_posts;

CREATE POLICY "Users can read own posts"
  ON public.content_posts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own posts"
  ON public.content_posts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own posts"
  ON public.content_posts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.content_posts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 5. OPTIMIZE RLS POLICIES - ANALYTICS_DATA TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own analytics" ON public.analytics_data;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_data;

CREATE POLICY "Users can read own analytics"
  ON public.analytics_data FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own analytics"
  ON public.analytics_data FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 6. OPTIMIZE RLS POLICIES - AI_SUGGESTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Users can insert own suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Users can update own suggestions" ON public.ai_suggestions;

CREATE POLICY "Users can read own suggestions"
  ON public.ai_suggestions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own suggestions"
  ON public.ai_suggestions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own suggestions"
  ON public.ai_suggestions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 7. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Recreate the handle_new_user function with explicit schema and stable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Ensure trigger is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
