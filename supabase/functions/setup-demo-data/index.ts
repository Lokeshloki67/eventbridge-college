import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Demo users to create
    const demoUsers = [
      // Admin
      { email: 'admin@college.edu', password: 'admin123', full_name: 'Admin User', role: 'admin' },
      
      // Staff
      { email: 'staff@college.edu', password: 'staff123', full_name: 'Michael Chen', role: 'staff' },
      { email: 'emily.rodriguez@college.edu', password: 'staff123', full_name: 'Emily Rodriguez', role: 'staff' },
      { email: 'david.kim@college.edu', password: 'staff123', full_name: 'David Kim', role: 'staff' },
      
      // Students
      { email: 'student@college.edu', password: 'student123', full_name: 'Alex Thompson', role: 'student' },
      { email: 'jessica.liu@student.edu', password: 'student123', full_name: 'Jessica Liu', role: 'student' },
      { email: 'ryan.patel@student.edu', password: 'student123', full_name: 'Ryan Patel', role: 'student' },
      { email: 'maria.garcia@student.edu', password: 'student123', full_name: 'Maria Garcia', role: 'student' },
      { email: 'james.wilson@student.edu', password: 'student123', full_name: 'James Wilson', role: 'student' },
    ];

    const createdUsers = [];

    // Create demo users
    for (const demoUser of demoUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser?.users.find(u => u.email === demoUser.email);

      if (!userExists) {
        // Create user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: demoUser.email,
          password: demoUser.password,
          email_confirm: true,
          user_metadata: {
            full_name: demoUser.full_name,
            role: demoUser.role
          }
        });

        if (createError) {
          console.error(`Error creating user ${demoUser.email}:`, createError);
          continue;
        }

        if (newUser.user) {
          createdUsers.push({ email: demoUser.email, role: demoUser.role });

          // Insert into user_roles table
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: newUser.user.id,
              role: demoUser.role
            });

          if (roleError) {
            console.error(`Error creating role for ${demoUser.email}:`, roleError);
          }
        }
      }
    }

    // Create demo events
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', 'admin@college.edu')
      .single();

    if (adminProfile) {
      const demoEvents = [
        {
          title: 'Tech Innovation Workshop',
          description: 'Learn about the latest in AI and machine learning',
          date: '2025-12-15',
          time: '10:00:00',
          location: 'Main Auditorium',
          capacity: 100,
          created_by: adminProfile.id
        },
        {
          title: 'Cultural Festival',
          description: 'Celebrate diversity with music, dance, and food',
          date: '2025-12-20',
          time: '14:00:00',
          location: 'Campus Grounds',
          capacity: 200,
          created_by: adminProfile.id
        },
        {
          title: 'Sports Day',
          description: 'Annual inter-department sports competition',
          date: '2025-12-18',
          time: '09:00:00',
          location: 'Sports Complex',
          capacity: 150,
          created_by: adminProfile.id
        }
      ];

      for (const event of demoEvents) {
        const { data: existingEvent } = await supabaseAdmin
          .from('events')
          .select('id')
          .eq('title', event.title)
          .maybeSingle();

        if (!existingEvent) {
          await supabaseAdmin.from('events').insert(event);
        }
      }

      // Assign staff to events
      const { data: staffProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .in('email', ['staff@college.edu', 'emily.rodriguez@college.edu', 'david.kim@college.edu']);

      const { data: events } = await supabaseAdmin
        .from('events')
        .select('id');

      if (staffProfiles && events && staffProfiles.length > 0 && events.length > 0) {
        for (let i = 0; i < Math.min(staffProfiles.length, events.length); i++) {
          const { data: existingAssignment } = await supabaseAdmin
            .from('staff_assignments')
            .select('id')
            .eq('staff_id', staffProfiles[i].id)
            .eq('event_id', events[i].id)
            .maybeSingle();

          if (!existingAssignment) {
            await supabaseAdmin
              .from('staff_assignments')
              .insert({
                staff_id: staffProfiles[i].id,
                event_id: events[i].id,
                assigned_by: adminProfile.id
              });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo data setup completed',
        usersCreated: createdUsers
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
