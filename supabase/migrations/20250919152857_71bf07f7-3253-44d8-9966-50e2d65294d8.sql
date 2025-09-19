-- Insert sample events
INSERT INTO public.events (title, description, date, time, location, capacity) VALUES
('Annual Tech Conference 2024', 'Join us for the biggest technology conference featuring AI, Web Development, and Innovation talks', '2024-03-15', '09:00:00', 'Main Auditorium', 200),
('Cultural Fest Celebration', 'A vibrant celebration of diverse cultures with performances, food, and art exhibitions', '2024-03-22', '14:00:00', 'College Ground', 500),
('Science Symposium', 'Research presentations and scientific discussions by students and faculty', '2024-04-05', '10:00:00', 'Science Building Hall', 150),
('Sports Championship', 'Inter-college sports competition including cricket, football, and athletics', '2024-04-12', '08:00:00', 'Sports Complex', 1000),
('Career Fair 2024', 'Meet with top companies and explore internship and job opportunities', '2024-04-20', '11:00:00', 'Exhibition Hall', 300);

-- Insert sample profiles with proper UUIDs
INSERT INTO public.profiles (user_id, full_name, email, role, d_no, phone_no) VALUES
(gen_random_uuid(), 'Dr. Sarah Johnson', 'admin@college.edu', 'admin', 'A001', '+1-555-0101'),
(gen_random_uuid(), 'Prof. Michael Chen', 'michael.chen@college.edu', 'staff', 'S101', '+1-555-0201'),
(gen_random_uuid(), 'Dr. Emily Rodriguez', 'emily.rodriguez@college.edu', 'staff', 'S102', '+1-555-0202'),
(gen_random_uuid(), 'Prof. David Kim', 'david.kim@college.edu', 'staff', 'S103', '+1-555-0203'),
(gen_random_uuid(), 'Alex Thompson', 'alex.thompson@student.edu', 'student', 'ST2024001', '+1-555-0301'),
(gen_random_uuid(), 'Jessica Liu', 'jessica.liu@student.edu', 'student', 'ST2024002', '+1-555-0302'),
(gen_random_uuid(), 'Ryan Patel', 'ryan.patel@student.edu', 'student', 'ST2024003', '+1-555-0303'),
(gen_random_uuid(), 'Maria Garcia', 'maria.garcia@student.edu', 'student', 'ST2024004', '+1-555-0304'),
(gen_random_uuid(), 'James Wilson', 'james.wilson@student.edu', 'student', 'ST2024005', '+1-555-0305');

-- Insert sample staff assignments (will use actual IDs from inserted data)
DO $$
DECLARE
    admin_id uuid;
    tech_event_id uuid;
    cultural_event_id uuid;
    science_event_id uuid;
    michael_id uuid;
    emily_id uuid;
    david_id uuid;
    alex_id uuid;
    jessica_id uuid;
BEGIN
    -- Get IDs from inserted data
    SELECT id INTO admin_id FROM public.profiles WHERE email = 'admin@college.edu';
    SELECT id INTO tech_event_id FROM public.events WHERE title = 'Annual Tech Conference 2024';
    SELECT id INTO cultural_event_id FROM public.events WHERE title = 'Cultural Fest Celebration';
    SELECT id INTO science_event_id FROM public.events WHERE title = 'Science Symposium';
    SELECT id INTO michael_id FROM public.profiles WHERE email = 'michael.chen@college.edu';
    SELECT id INTO emily_id FROM public.profiles WHERE email = 'emily.rodriguez@college.edu';
    SELECT id INTO david_id FROM public.profiles WHERE email = 'david.kim@college.edu';
    SELECT id INTO alex_id FROM public.profiles WHERE email = 'alex.thompson@student.edu';
    SELECT id INTO jessica_id FROM public.profiles WHERE email = 'jessica.liu@student.edu';

    -- Insert staff assignments
    INSERT INTO public.staff_assignments (staff_id, event_id, assigned_by) VALUES
    (michael_id, tech_event_id, admin_id),
    (emily_id, cultural_event_id, admin_id),
    (david_id, science_event_id, admin_id);

    -- Insert sample event registrations
    INSERT INTO public.event_registrations (user_id, event_id, registration_data) VALUES
    (alex_id, tech_event_id, '{"dietary_requirements": "None", "emergency_contact": "+1-555-9999", "special_needs": "None"}'),
    (jessica_id, cultural_event_id, '{"dietary_requirements": "Vegetarian", "emergency_contact": "+1-555-8888", "special_needs": "None"}'),
    (alex_id, cultural_event_id, '{"dietary_requirements": "None", "emergency_contact": "+1-555-9999", "special_needs": "None"}');

    -- Insert sample attendance records
    INSERT INTO public.attendance (student_id, event_id, staff_id, is_present, marks, lot_number) VALUES
    (alex_id, tech_event_id, michael_id, true, 85, 'LOT001'),
    (jessica_id, cultural_event_id, emily_id, true, 92, 'LOT002');
END $$;