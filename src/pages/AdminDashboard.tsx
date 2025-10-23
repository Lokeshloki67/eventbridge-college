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
  created_at: string;
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
    phone_no: string;
    d_no: string;
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
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditRegistrationOpen, setIsEditRegistrationOpen] = useState(false);
  const [isAddRegistrationOpen, setIsAddRegistrationOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingStaff, setEditingStaff] = useState<Profile | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<EventRegistration | null>(null);
  const [students, setStudents] = useState<Profile[]>([]);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 50,
  });

  const [staffForm, setStaffForm] = useState({
    full_name: '',
    email: '',
    phone_no: '',
    d_no: ''
  });

  const [assignmentForm, setAssignmentForm] = useState({
    staff_id: '',
    event_id: '',
  });

  const [registrationForm, setRegistrationForm] = useState({
    full_name: '',
    email: '',
    phone_no: '',
    d_no: ''
  });

  const [newRegistrationForm, setNewRegistrationForm] = useState({
    user_id: '',
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
        fetchStaffAssignments(),
        fetchEventRegistrations(),
        fetchStudents(),
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
        profiles!event_registrations_user_id_fkey(id, full_name, email, phone_no, d_no),
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

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventForm)
          .eq('id', editingEvent.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        // Create new event
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
      }

      setIsEventDialogOpen(false);
      setEditingEvent(null);
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
        description: editingEvent ? "Failed to update event" : "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
    });
    setIsEventDialogOpen(true);
  };

  const handleEditStaff = (staffMember: Profile) => {
    setEditingStaff(staffMember);
    setStaffForm({
      full_name: staffMember.full_name,
      email: staffMember.email,
      phone_no: staffMember.phone_no || '',
      d_no: staffMember.d_no || ''
    });
    setIsStaffDialogOpen(true);
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      full_name: '',
      email: '',
      phone_no: '',
      d_no: ''
    });
    setIsStaffDialogOpen(true);
  };

  const handleSaveStaff = async () => {
    try {
      if (editingStaff) {
        // Update existing staff
        const { error } = await supabase
          .from('profiles')
          .update(staffForm)
          .eq('id', editingStaff.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Staff member updated successfully",
        });
      } else {
        // For adding new staff, we need to guide them to create auth account first
        toast({
          title: "Info",
          description: "Please create a staff auth account first in Supabase Authentication, then their profile will appear here for editing.",
          variant: "default",
        });
        setIsStaffDialogOpen(false);
        return;
      }

      setIsStaffDialogOpen(false);
      setEditingStaff(null);
      setStaffForm({
        full_name: '',
        email: '',
        phone_no: '',
        d_no: ''
      });
      fetchStaff();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save staff member",
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

      setIsAssignDialogOpen(false);
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

  const handleEditRegistration = (registration: EventRegistration) => {
    setEditingRegistration(registration);
    setRegistrationForm({
      full_name: registration.profiles?.full_name || '',
      email: registration.profiles?.email || '',
      phone_no: registration.profiles?.phone_no || '',
      d_no: registration.profiles?.d_no || ''
    });
    setIsEditRegistrationOpen(true);
  };

  const handleUpdateRegistration = async () => {
    if (!editingRegistration) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(registrationForm)
        .eq('id', editingRegistration.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student details updated successfully",
      });

      setIsEditRegistrationOpen(false);
      setEditingRegistration(null);
      fetchEventRegistrations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student details",
        variant: "destructive",
      });
    }
  };

  const handleAddRegistration = async () => {
    try {
      if (!newRegistrationForm.user_id || !newRegistrationForm.event_id) {
        toast({
          title: "Error",
          description: "Please select both student and event",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          user_id: newRegistrationForm.user_id,
          event_id: newRegistrationForm.event_id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student registered to event successfully",
      });

      setIsAddRegistrationOpen(false);
      setNewRegistrationForm({
        user_id: '',
        event_id: '',
      });
      fetchEventRegistrations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register student to event",
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
            Welcome back, {user?.email}! Manage events, staff, and registrations.
          </p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="assignments">Staff Assignments</TabsTrigger>
            <TabsTrigger value="registrations">Event Registrations</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
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
                  <Dialog open={isEventDialogOpen} onOpenChange={(open) => {
                    setIsEventDialogOpen(open);
                    if (!open) {
                      setEditingEvent(null);
                      setEventForm({
                        title: '',
                        description: '',
                        date: '',
                        time: '',
                        location: '',
                        capacity: 50,
                      });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                        <DialogDescription>
                          {editingEvent ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
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
                        <Button onClick={handleCreateEvent}>
                          {editingEvent ? 'Update Event' : 'Create Event'}
                        </Button>
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
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
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

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Staff Management
                    </CardTitle>
                    <CardDescription>Manage staff member profiles</CardDescription>
                  </div>
                  <Button onClick={handleAddStaff}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>D.No</TableHead>
                      <TableHead>Actions</TableHead>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStaff(member)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Add/Edit Staff Dialog */}
            <Dialog open={isStaffDialogOpen} onOpenChange={(open) => {
              setIsStaffDialogOpen(open);
              if (!open) {
                setEditingStaff(null);
                setStaffForm({
                  full_name: '',
                  email: '',
                  phone_no: '',
                  d_no: ''
                });
              }
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
                  <DialogDescription>
                    {editingStaff ? 
                      'Update staff member information below.' :
                      'Note: Create the staff auth account in Supabase Authentication first with role=staff.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="staff_name">Full Name</Label>
                    <Input
                      id="staff_name"
                      value={staffForm.full_name}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Staff name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff_email">Email</Label>
                    <Input
                      id="staff_email"
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff_phone">Phone Number</Label>
                    <Input
                      id="staff_phone"
                      value={staffForm.phone_no}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, phone_no: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff_dno">D.No</Label>
                    <Input
                      id="staff_dno"
                      value={staffForm.d_no}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, d_no: e.target.value }))}
                      placeholder="Department number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveStaff}>
                    {editingStaff ? 'Update Staff' : 'Add Staff'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Staff Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Staff Assignments
                    </CardTitle>
                    <CardDescription>Assign staff members to events</CardDescription>
                  </div>
                  <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Staff
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
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.profiles?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{assignment.events?.title || 'N/A'}</TableCell>
                        <TableCell>
                          {assignment.events?.date ? 
                            new Date(assignment.events.date).toLocaleDateString() : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveStaffAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Registrations Tab */}
          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Event Registrations
                    </CardTitle>
                    <CardDescription>View and manage student event registrations</CardDescription>
                  </div>
                  <Dialog open={isAddRegistrationOpen} onOpenChange={setIsAddRegistrationOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Registration
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register Student to Event</DialogTitle>
                        <DialogDescription>
                          Select a student and event to create a registration.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="student">Student</Label>
                          <Select
                            value={newRegistrationForm.user_id}
                            onValueChange={(value) => setNewRegistrationForm(prev => ({ ...prev, user_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.full_name} ({student.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="reg_event">Event</Label>
                          <Select
                            value={newRegistrationForm.event_id}
                            onValueChange={(value) => setNewRegistrationForm(prev => ({ ...prev, event_id: value }))}
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
                        <Button onClick={handleAddRegistration}>Register Student</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {eventRegistrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>D.No</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Registered Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">
                            {registration.profiles?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{registration.profiles?.email || 'N/A'}</TableCell>
                          <TableCell>{registration.profiles?.phone_no || 'N/A'}</TableCell>
                          <TableCell>{registration.profiles?.d_no || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge>{registration.events?.title || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(registration.registered_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRegistration(registration)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
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

            {/* Edit Registration Dialog */}
            <Dialog open={isEditRegistrationOpen} onOpenChange={setIsEditRegistrationOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Student Details</DialogTitle>
                  <DialogDescription>
                    Update student information below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reg_name">Full Name</Label>
                    <Input
                      id="reg_name"
                      value={registrationForm.full_name}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Student name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg_email">Email</Label>
                    <Input
                      id="reg_email"
                      type="email"
                      value={registrationForm.email}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg_phone">Phone Number</Label>
                    <Input
                      id="reg_phone"
                      value={registrationForm.phone_no}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, phone_no: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg_dno">D.No</Label>
                    <Input
                      id="reg_dno"
                      value={registrationForm.d_no}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, d_no: e.target.value }))}
                      placeholder="Department number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateRegistration}>Update Student</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
