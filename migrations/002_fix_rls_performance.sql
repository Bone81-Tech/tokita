-- MIGRATION: Fix RLS Performance on public.custom_users table
--
-- This script addresses the "Auth RLS Initialization Plan" performance warnings
-- for the 'custom_users' table by wrapping auth function calls in a sub-select.
-- This ensures the function is only evaluated once per query.
--
-- HOW TO USE:
-- 1. Copy the content of this file.
-- 2. Go to your Supabase project's SQL Editor.
-- 3. Paste the content into a new query and click "RUN".
--
-- NOTE:
-- This script ONLY fixes the policies for the 'custom_users' table based on the
-- information provided. You MUST apply the same pattern for all other policies
-- on other tables (products, categories, etc.) that are reported by the
- - Supabase Performance Advisor.

-- Policy 1: "Users can view their own profile."
ALTER POLICY "Users can view their own profile."
ON public.custom_users
USING (((SELECT auth.jwt()) ->> 'username'::text) = username)
WITH CHECK (((SELECT auth.jwt()) ->> 'username'::text) = username);

-- Policy 2: "Users can update their own profile."
ALTER POLICY "Users can update their own profile."
ON public.custom_users
USING (((SELECT auth.jwt()) ->> 'username'::text) = username)
WITH CHECK (((SELECT auth.jwt()) ->> 'username'::text) = username);

-- Policy 3: "Custom Users can view their own profile."
ALTER POLICY "Custom Users can view their own profile."
ON public.custom_users
USING (((SELECT auth.uid()) IS NOT NULL) AND (((SELECT auth.jwt()) ->> 'username'::text) = username))
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (((SELECT auth.jwt()) ->> 'username'::text) = username));
