-- Insert Sample Events
INSERT INTO public.events (title, description, date, time, location, capacity) VALUES
('Tech Workshop 2025', 'Learn latest technologies and frameworks', '2025-11-15', '10:00:00', 'Computer Lab A', 50),
('Cultural Fest', 'Annual cultural celebration with performances', '2025-11-20', '14:00:00', 'Main Auditorium', 200),
('Sports Day', 'Inter-department sports competition', '2025-11-25', '09:00:00', 'Sports Ground', 100),
('Career Fair', 'Meet recruiters from top companies', '2025-12-01', '11:00:00', 'Convention Center', 150),
('Science Exhibition', 'Showcase innovative projects and research', '2025-12-05', '10:30:00', 'Science Block', 80);

-- Update staff profiles with sample data
-- Note: This assumes profiles were already created by the handle_new_user trigger
UPDATE public.profiles 
SET 
  full_name = 'Dr. Rajesh Kumar',
  phone_no = '+91-9876543210',
  d_no = 'CS101'
WHERE email = 'staff1@example.com';

UPDATE public.profiles 
SET 
  full_name = 'Prof. Priya Sharma',
  phone_no = '+91-9876543211',
  d_no = 'EE102'
WHERE email = 'staff2@example.com';

UPDATE public.profiles 
SET 
  full_name = 'Dr. Amit Patel',
  phone_no = '+91-9876543212',
  d_no = 'ME103'
WHERE email = 'staff3@example.com';

-- Update student profiles with sample data
UPDATE public.profiles 
SET 
  full_name = 'Rahul Verma',
  phone_no = '+91-9123456789',
  d_no = '21CS001'
WHERE email = 'student1@example.com';

UPDATE public.profiles 
SET 
  full_name = 'Sneha Reddy',
  phone_no = '+91-9123456790',
  d_no = '21CS002'
WHERE email = 'student2@example.com';

UPDATE public.profiles 
SET 
  full_name = 'Arjun Singh',
  phone_no = '+91-9123456791',
  d_no = '21EE001'
WHERE email = 'student3@example.com';

UPDATE public.profiles 
SET 
  full_name = 'Kavya Nair',
  phone_no = '+91-9123456792',
  d_no = '21EE002'
WHERE email = 'student4@example.com';

UPDATE public.profiles 
SET 
  full_name = 'Rohan Desai',
  phone_no = '+91-9123456793',
  d_no = '21ME001'
WHERE email = 'student5@example.com';

-- Insert Staff Assignments (Assign staff to events)
INSERT INTO public.staff_assignments (staff_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'staff1@example.com' AND e.title = 'Tech Workshop 2025';

INSERT INTO public.staff_assignments (staff_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'staff2@example.com' AND e.title = 'Cultural Fest';

INSERT INTO public.staff_assignments (staff_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'staff2@example.com' AND e.title = 'Sports Day';

INSERT INTO public.staff_assignments (staff_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'staff3@example.com' AND e.title = 'Career Fair';

INSERT INTO public.staff_assignments (staff_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'staff3@example.com' AND e.title = 'Science Exhibition';

-- Insert Event Registrations (Students registered to events)
INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student1@example.com' AND e.title = 'Tech Workshop 2025';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student1@example.com' AND e.title = 'Cultural Fest';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student2@example.com' AND e.title = 'Cultural Fest';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student2@example.com' AND e.title = 'Sports Day';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student3@example.com' AND e.title = 'Sports Day';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student3@example.com' AND e.title = 'Career Fair';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student4@example.com' AND e.title = 'Career Fair';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student4@example.com' AND e.title = 'Science Exhibition';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student5@example.com' AND e.title = 'Tech Workshop 2025';

INSERT INTO public.event_registrations (user_id, event_id)
SELECT 
  p.id,
  e.id
FROM public.profiles p
CROSS JOIN public.events e
WHERE p.email = 'student5@example.com' AND e.title = 'Science Exhibition';