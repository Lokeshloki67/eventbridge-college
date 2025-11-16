-- Fix Issue #2: Remove role field from profiles table to prevent privilege escalation

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Remove the role column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Create more restrictive UPDATE policy that prevents tampering with user_id and email
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  user_id = (SELECT user_id FROM public.profiles WHERE id = profiles.id) AND
  email = (SELECT email FROM public.profiles WHERE id = profiles.id)
);

-- Prevent direct inserts (only trigger should create profiles)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Add policy to prevent any direct inserts
CREATE POLICY "Only system can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (false);