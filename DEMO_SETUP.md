# Demo Data Setup Instructions

This guide will help you set up demo users and data for testing the event management system.

## Quick Setup Option 1: Use the Edge Function

After the app is deployed, the `setup-demo-data` edge function will be available. You can call it once to create all demo data:

1. Open your browser console on any page of the app
2. Run this command:
```javascript
fetch('https://eudtkjrfcykohtlrrvda.supabase.co/functions/v1/setup-demo-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json()).then(console.log)
```

## Manual Setup Option 2: Create Users in Supabase Dashboard

### Step 1: Create Auth Users

Go to [Supabase Authentication → Users](https://supabase.com/dashboard/project/eudtkjrfcykohtlrrvda/auth/users) and create these users:

**Admin User:**
- Email: `admin@college.edu`
- Password: `admin123`
- Auto Confirm User: ✅ Yes
- User Metadata:
  ```json
  {
    "full_name": "Admin User",
    "role": "admin"
  }
  ```

**Staff Users:**
1. Email: `staff@college.edu`, Password: `staff123`
   - Metadata: `{"full_name": "Michael Chen", "role": "staff"}`
2. Email: `emily.rodriguez@college.edu`, Password: `staff123`
   - Metadata: `{"full_name": "Emily Rodriguez", "role": "staff"}`
3. Email: `david.kim@college.edu`, Password: `staff123`
   - Metadata: `{"full_name": "David Kim", "role": "staff"}`

**Student Users:**
1. Email: `student@college.edu`, Password: `student123`
   - Metadata: `{"full_name": "Alex Thompson", "role": "student"}`
2. Email: `jessica.liu@student.edu`, Password: `student123`
   - Metadata: `{"full_name": "Jessica Liu", "role": "student"}`
3. Email: `ryan.patel@student.edu`, Password: `student123`
   - Metadata: `{"full_name": "Ryan Patel", "role": "student"}`
4. Email: `maria.garcia@student.edu`, Password: `student123`
   - Metadata: `{"full_name": "Maria Garcia", "role": "student"}`
5. Email: `james.wilson@student.edu`, Password: `student123`
   - Metadata: `{"full_name": "James Wilson", "role": "student"}`

### Step 2: Add User Roles

After creating the auth users, go to [SQL Editor](https://supabase.com/dashboard/project/eudtkjrfcykohtlrrvda/sql/new) and run:

```sql
-- Get user IDs and insert roles
DO $$
DECLARE
  admin_id uuid;
  staff_id1 uuid;
  staff_id2 uuid;
  staff_id3 uuid;
  student_id1 uuid;
  student_id2 uuid;
  student_id3 uuid;
  student_id4 uuid;
  student_id5 uuid;
BEGIN
  -- Get user IDs
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@college.edu';
  SELECT id INTO staff_id1 FROM auth.users WHERE email = 'staff@college.edu';
  SELECT id INTO staff_id2 FROM auth.users WHERE email = 'emily.rodriguez@college.edu';
  SELECT id INTO staff_id3 FROM auth.users WHERE email = 'david.kim@college.edu';
  SELECT id INTO student_id1 FROM auth.users WHERE email = 'student@college.edu';
  SELECT id INTO student_id2 FROM auth.users WHERE email = 'jessica.liu@student.edu';
  SELECT id INTO student_id3 FROM auth.users WHERE email = 'ryan.patel@student.edu';
  SELECT id INTO student_id4 FROM auth.users WHERE email = 'maria.garcia@student.edu';
  SELECT id INTO student_id5 FROM auth.users WHERE email = 'james.wilson@student.edu';

  -- Insert roles
  INSERT INTO user_roles (user_id, role) VALUES
    (admin_id, 'admin'),
    (staff_id1, 'staff'),
    (staff_id2, 'staff'),
    (staff_id3, 'staff'),
    (student_id1, 'student'),
    (student_id2, 'student'),
    (student_id3, 'student'),
    (student_id4, 'student'),
    (student_id5, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
```

### Step 3: Create Demo Events

Run this SQL to create sample events:

```sql
DO $$
DECLARE
  admin_profile_id uuid;
BEGIN
  -- Get admin profile ID
  SELECT id INTO admin_profile_id FROM profiles WHERE email = 'admin@college.edu';

  -- Insert demo events
  INSERT INTO events (title, description, date, time, location, capacity, created_by) VALUES
    ('Tech Innovation Workshop', 'Learn about the latest in AI and machine learning', '2025-12-15', '10:00:00', 'Main Auditorium', 100, admin_profile_id),
    ('Cultural Festival', 'Celebrate diversity with music, dance, and food', '2025-12-20', '14:00:00', 'Campus Grounds', 200, admin_profile_id),
    ('Sports Day', 'Annual inter-department sports competition', '2025-12-18', '09:00:00', 'Sports Complex', 150, admin_profile_id)
  ON CONFLICT DO NOTHING;
END $$;
```

### Step 4: Assign Staff to Events

```sql
DO $$
DECLARE
  admin_profile_id uuid;
  staff_profile_id1 uuid;
  staff_profile_id2 uuid;
  staff_profile_id3 uuid;
  event_id1 uuid;
  event_id2 uuid;
  event_id3 uuid;
BEGIN
  -- Get profile IDs
  SELECT id INTO admin_profile_id FROM profiles WHERE email = 'admin@college.edu';
  SELECT id INTO staff_profile_id1 FROM profiles WHERE email = 'staff@college.edu';
  SELECT id INTO staff_profile_id2 FROM profiles WHERE email = 'emily.rodriguez@college.edu';
  SELECT id INTO staff_profile_id3 FROM profiles WHERE email = 'david.kim@college.edu';
  
  -- Get event IDs
  SELECT id INTO event_id1 FROM events WHERE title = 'Tech Innovation Workshop';
  SELECT id INTO event_id2 FROM events WHERE title = 'Cultural Festival';
  SELECT id INTO event_id3 FROM events WHERE title = 'Sports Day';

  -- Create staff assignments
  INSERT INTO staff_assignments (staff_id, event_id, assigned_by) VALUES
    (staff_profile_id1, event_id1, admin_profile_id),
    (staff_profile_id2, event_id2, admin_profile_id),
    (staff_profile_id3, event_id3, admin_profile_id)
  ON CONFLICT DO NOTHING;
END $$;
```

## Demo Credentials

After setup, you can login with these credentials:

**Admin:**
- Email: admin@college.edu
- Password: admin123

**Staff:**
- Email: staff@college.edu
- Password: staff123

**Students:**
- Email: student@college.edu
- Password: student123

(Additional staff and student accounts are available - see the full list above)

## Important Notes

1. Make sure "Confirm email" is **disabled** in Supabase Auth settings for faster testing
2. The `handle_new_user()` trigger will automatically create profiles when users sign up
3. The `sync_user_role()` trigger will sync roles from profiles to user_roles table
4. All demo credentials are shown on the login page for easy access
