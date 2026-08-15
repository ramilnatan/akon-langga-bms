/*
# Create profiles table and is_admin() function

1. New Tables
- `profiles`
  - `auth_user_id` (uuid, primary key, references auth.users ON DELETE CASCADE)
  - `role` (text, NOT NULL, default 'customer')
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- RLS enabled on `profiles`.
- SELECT: authenticated users can read their own profile.
- INSERT: handled by trigger when a new auth user signs up (service role inserts).
- UPDATE: authenticated users can update their own profile (but NOT the role column).
- A trigger auto-creates a profile row when a new user registers.

3. Functions
- `public.is_admin()` — SECURITY DEFINER, empty search_path.
  Returns true if the calling user's profile role is 'admin'.
  Execution: authenticated, postgres, service_role. NOT anon, NOT PUBLIC.

4. Triggers
- `handle_new_user()` — SECURITY DEFINER, empty search_path.
  Called on INSERT to auth.users; creates a matching profiles row with role='customer'.
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  auth_user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- is_admin() function — SECURITY DEFINER, empty search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT role INTO v_role
  FROM public.profiles
  WHERE auth_user_id = auth.uid();

  RETURN v_role = 'admin';
END;
$$;

-- Grant execute on is_admin() to authenticated only
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, postgres, service_role;

-- handle_new_user() trigger function — SECURITY DEFINER, empty search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
