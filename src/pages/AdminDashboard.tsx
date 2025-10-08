import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  UserPlus,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  d_no: string;
  phone_no: string;
}

interface StaffAssignment {
  id: string;
  staff_id: string;
  event_id: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
  events: {
    id: string;
    title: string;
    date: string;
  };
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  registration_data: any;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
  events: {
    id: string;
    title: string;
    date: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isStaffAssignDialogOpen, setIsStaffAssignDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    email: '',
    phone_no: '',
    d_no: ''
  });

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 50,
  });
  const [assignmentForm, setAssignmentForm] = useState({
    staff_id: '',
    event_id: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchEvents(),
        fetchStaff(),
        fetchStudents(),
        fetchStaffAssignments(),
        fetchEventRegistrations(),
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (data) setEvents(data);
  };

  const fetchStaff = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'staff')
      .order('full_name');
    
    if (data) setStaff(data);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('full_name');
    
    if (data) setStudents(data);
  };

  const fetchStaffAssignments = async () => {
    const { data } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        profiles!staff_assignments_staff_id_fkey(id, full_name, email),
        events(id, title, date)
      `);
    
    if (data) setStaffAssignments(data);
  };

  const fetchEventRegistrations = async () => {
    const { data } = await supabase
      .from('event_registrations')
      .select(`
        *,
        profiles!event_registrations_user_id_fkey(id, full_name, email),
        events(id, title, date)
      `)
      .order('registered_at', { ascending: false });
    
    if (data) setEventRegistrations(data);
  };

  const handleCreateEvent = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.uid)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('events')
        .insert({
          ...eventForm,
          created_by: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setIsEventDialogOpen(false);
      setEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        capacity: 50,
      });
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleAssignStaff = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.uid)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('staff_assignments')
        .insert({
          ...assignmentForm,
          assigned_by: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff assigned to event successfully",
      });

      setIsStaffAssignDialogOpen(false);
      setAssignmentForm({
        staff_id: '',
        event_id: '',
      });
      fetchStaffAssignments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStaffAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('staff_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff assignment removed successfully",
      });

      fetchStaffAssignments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove staff assignment",
        variant: "destructive",
      });
    }
  };

  const handleEditStudent = (student: Profile) => {
    setSelectedStudent(student);
    setStudentForm({
      full_name: student.full_name,
      email: student.email,
      phone_no: student.phone_no || '',
      d_no: student.d_no || ''
    });
    setIsEditStudentDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(studentForm)
        .eq('id', selectedStudent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student details updated successfully",
      });

      setIsEditStudentDialogOpen(false);
      fetchStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student details",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}! Manage events, staff, and students.
          </p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Events Management
                    </CardTitle>
                    <CardDescription>Create and manage events</CardDescription>
                  </div>
                  <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>
                          Fill in the details to create a new event.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={eventForm.title}
                            onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Event title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={eventForm.description}
                            onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Event description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={eventForm.date}
                              onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="time">Time</Label>
                            <Input
                              id="time"
                              type="time"
                              value={eventForm.time}
                              onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={eventForm.location}
                            onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Event location"
                          />
                        </div>
                        <div>
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={eventForm.capacity}
                            onChange={(e) => setEventForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 50 }))}
                            placeholder="Maximum participants"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateEvent}>Create Event</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>{event.time}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>{event.capacity}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Event Registrations
                </CardTitle>
                <CardDescription>View all student event registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {eventRegistrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Student Email</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Registered At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">
                            {registration.profiles?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{registration.profiles?.email || 'N/A'}</TableCell>
                          <TableCell>{registration.events?.title || 'N/A'}</TableCell>
                          <TableCell>
                            {registration.events?.date ? 
                              new Date(registration.events.date).toLocaleDateString() : 
                              'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            {new Date(registration.registered_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No event registrations found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Staff Management
                </CardTitle>
                <CardDescription>Manage staff members</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>D.No</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone_no || 'N/A'}</TableCell>
                        <TableCell>{member.d_no || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Students Management
                </CardTitle>
                <CardDescription>View and manage student records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>D.No</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone_no || 'N/A'}</TableCell>
                        <TableCell>{student.d_no || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Student Dialog */}
            <Dialog open={isEditStudentDialogOpen} onOpenChange={setIsEditStudentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Student Details</DialogTitle>
                  <DialogDescription>
                    Update student information below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="student_name">Full Name</Label>
                    <Input
                      id="student_name"
                      value={studentForm.full_name}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Student name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student_email">Email</Label>
                    <Input
                      id="student_email"
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student_phone">Phone Number</Label>
                    <Input
                      id="student_phone"
                      value={studentForm.phone_no}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, phone_no: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student_dno">D.No</Label>
                    <Input
                      id="student_dno"
                      value={studentForm.d_no}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, d_no: e.target.value }))}
                      placeholder="Department number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateStudent}>Update Student</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Staff Management
                </CardTitle>
                <CardDescription>Manage staff members and assign them to events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Dialog open={isStaffAssignDialogOpen} onOpenChange={setIsStaffAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Staff to Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Staff to Event</DialogTitle>
                        <DialogDescription>
                          Select a staff member and event to create an assignment.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="staff">Staff Member</Label>
                          <Select
                            value={assignmentForm.staff_id}
                            onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, staff_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff member" />
                            </SelectTrigger>
                            <SelectContent>
                              {staff.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="event">Event</Label>
                          <Select
                            value={assignmentForm.event_id}
                            onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, event_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                            <SelectContent>
                              {events.map((event) => (
                                <SelectItem key={event.id} value={event.id}>
                                  {event.title} - {new Date(event.date).toLocaleDateString()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAssignStaff}>Assign Staff</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <h3 className="text-lg font-semibold mb-4">All Staff Members</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>D.No</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone_no || 'N/A'}</TableCell>
                        <TableCell>{member.d_no || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <h3 className="text-lg font-semibold mt-8 mb-4">Staff Assignments</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.profiles?.full_name}
                        </TableCell>
                        <TableCell>{assignment.events?.title}</TableCell>
                        <TableCell>
                          {assignment.events?.date ? 
                            new Date(assignment.events.date).toLocaleDateString() : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveStaffAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;