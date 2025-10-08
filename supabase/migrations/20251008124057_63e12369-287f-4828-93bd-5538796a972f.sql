-- Step 1: Create app_role enum
CREATE TYPE public.app_role AS ENUM ('student', 'staff', 'admin');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: Create function to automatically assign user role on profile creation
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert role from profiles.role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, NEW.role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync roles
CREATE TRIGGER on_profile_created_sync_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();

-- Step 5: Migrate existing profiles data to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Drop old RLS policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Step 7: Create new RLS policies using security definer function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view student profiles"
  ON public.profiles
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'staff') 
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 8: Update other table policies to use has_role function
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Staff can view registrations for their events" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage staff assignments" ON public.staff_assignments;
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;

CREATE POLICY "Admins can manage registrations"
  ON public.event_registrations
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view registrations for their events"
  ON public.event_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM staff_assignments sa
      JOIN profiles p ON p.id = sa.staff_id
      WHERE p.user_id = auth.uid()
        AND sa.event_id = event_registrations.event_id
    )
  );

CREATE POLICY "Admins can manage events"
  ON public.events
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage staff assignments"
  ON public.staff_assignments
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all attendance"
  ON public.attendance
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 9: Create policy for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));