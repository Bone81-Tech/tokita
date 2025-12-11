-- MIGRATION: Fix Function Search Path
--
-- This script addresses the "Function Search Path Mutable" security warning
-- from Supabase by explicitly setting a secure search_path for the identified functions.
--
-- HOW TO USE:
-- 1. Copy the content of this file.
-- 2. Go to your Supabase project's SQL Editor.
-- 3. Paste the content into a new query.
-- 4. Click "RUN".
--
-- If you encounter an error like "function name(argument) does not exist", 
-- it means the function has different arguments. You can see the correct
-- function definition in the Supabase Dashboard under Database -> Functions.

-- Fix for the trigger function that updates timestamps.
-- This function almost never has arguments.
ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public;

-- Fix for the user role function.
-- This assumes the function has no arguments (e.g., it uses auth.uid() internally).
-- If it has arguments (e.g., get_user_role(user_id uuid)), you must add them inside the parentheses.
ALTER FUNCTION public.get_user_role()
  SET search_path = public;

-- Example of what to do if the function has arguments:
--
-- ALTER FUNCTION public.get_user_role(p_user_id uuid)
--   SET search_path = public;
--

-- After running, you can verify the fix in the Database Health report.
