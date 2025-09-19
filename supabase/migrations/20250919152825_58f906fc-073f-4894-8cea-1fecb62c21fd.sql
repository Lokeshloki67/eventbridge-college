-- Insert sample events
INSERT INTO public.events (title, description, date, time, location, capacity) VALUES
('Annual Tech Conference 2024', 'Join us for the biggest technology conference featuring AI, Web Development, and Innovation talks', '2024-03-15', '09:00:00', 'Main Auditorium', 200),
('Cultural Fest Celebration', 'A vibrant celebration of diverse cultures with performances, food, and art exhibitions', '2024-03-22', '14:00:00', 'College Ground', 500),
('Science Symposium', 'Research presentations and scientific discussions by students and faculty', '2024-04-05', '10:00:00', 'Science Building Hall', 150),
('Sports Championship', 'Inter-college sports competition including cricket, football, and athletics', '2024-04-12', '08:00:00', 'Sports Complex', 1000),
('Career Fair 2024', 'Meet with top companies and explore internship and job opportunities', '2024-04-20', '11:00:00', 'Exhibition Hall', 300);

-- Insert sample admin profile (will be created by trigger when user signs up)
-- Insert sample staff profiles  
INSERT INTO public.profiles (user_id, full_name, email, role, d_no, phone_no) VALUES
('admin-demo-uid', 'Dr. Sarah Johnson', 'admin@college.edu', 'admin', 'A001', '+1-555-0101'),
('staff1-demo-uid', 'Prof. Michael Chen', 'michael.chen@college.edu', 'staff', 'S101', '+1-555-0201'),
('staff2-demo-uid', 'Dr. Emily Rodriguez', 'emily.rodriguez@college.edu', 'staff', 'S102', '+1-555-0202'),
('staff3-demo-uid', 'Prof. David Kim', 'david.kim@college.edu', 'staff', 'S103', '+1-555-0203'),
('student1-demo-uid', 'Alex Thompson', 'alex.thompson@student.edu', 'student', 'ST2024001', '+1-555-0301'),
('student2-demo-uid', 'Jessica Liu', 'jessica.liu@student.edu', 'student', 'ST2024002', '+1-555-0302'),
('student3-demo-uid', 'Ryan Patel', 'ryan.patel@student.edu', 'student', 'ST2024003', '+1-555-0303'),
('student4-demo-uid', 'Maria Garcia', 'maria.garcia@student.edu', 'student', 'ST2024004', '+1-555-0304'),
('student5-demo-uid', 'James Wilson', 'james.wilson@student.edu', 'student', 'ST2024005', '+1-555-0305');

-- Insert sample staff assignments
INSERT INTO public.staff_assignments (staff_id, event_id, assigned_by) 
SELECT 
  s.id as staff_id,
  e.id as event_id,
  a.id as assigned_by
FROM 
  (SELECT id FROM public.profiles WHERE email = 'michael.chen@college.edu') s,
  (SELECT id FROM public.events WHERE title = 'Annual Tech Conference 2024') e,
  (SELECT id FROM public.profiles WHERE email = 'admin@college.edu') a;

INSERT INTO public.staff_assignments (staff_id, event_id, assigned_by) 
SELECT 
  s.id as staff_id,
  e.id as event_id,
  a.id as assigned_by
FROM 
  (SELECT id FROM public.profiles WHERE email = 'emily.rodriguez@college.edu') s,
  (SELECT id FROM public.events WHERE title = 'Cultural Fest Celebration') e,
  (SELECT id FROM public.profiles WHERE email = 'admin@college.edu') a;

INSERT INTO public.staff_assignments (staff_id, event_id, assigned_by) 
SELECT 
  s.id as staff_id,
  e.id as event_id,
  a.id as assigned_by
FROM 
  (SELECT id FROM public.profiles WHERE email = 'david.kim@college.edu') s,
  (SELECT id FROM public.events WHERE title = 'Science Symposium') e,
  (SELECT id FROM public.profiles WHERE email = 'admin@college.edu') a;

-- Insert sample event registrations
INSERT INTO public.event_registrations (user_id, event_id, registration_data)
SELECT 
  p.id as user_id,
  e.id as event_id,
  jsonb_build_object(
    'dietary_requirements', 'None',
    'emergency_contact', '+1-555-9999',
    'special_needs', 'None'
  ) as registration_data
FROM 
  public.profiles p,
  public.events e
WHERE 
  p.role = 'student' 
  AND e.title IN ('Annual Tech Conference 2024', 'Cultural Fest Celebration', 'Career Fair 2024')
  AND p.email IN ('alex.thompson@student.edu', 'jessica.liu@student.edu', 'ryan.patel@student.edu');

-- Insert sample attendance records
INSERT INTO public.attendance (student_id, event_id, staff_id, is_present, marks, lot_number)
SELECT 
  st.id as student_id,
  e.id as event_id,
  sf.id as staff_id,
  true as is_present,
  85 as marks,
  'LOT001' as lot_number
FROM 
  (SELECT id FROM public.profiles WHERE email = 'alex.thompson@student.edu') st,
  (SELECT id FROM public.events WHERE title = 'Annual Tech Conference 2024') e,
  (SELECT id FROM public.profiles WHERE email = 'michael.chen@college.edu') sf;

INSERT INTO public.attendance (student_id, event_id, staff_id, is_present, marks, lot_number)
SELECT 
  st.id as student_id,
  e.id as event_id,
  sf.id as staff_id,
  true as is_present,
  92 as marks,
  'LOT002' as lot_number
FROM 
  (SELECT id FROM public.profiles WHERE email = 'jessica.liu@student.edu') st,
  (SELECT id FROM public.events WHERE title = 'Cultural Fest Celebration') e,
  (SELECT id FROM public.profiles WHERE email = 'emily.rodriguez@college.edu') sf;