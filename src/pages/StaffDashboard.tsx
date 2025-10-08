import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, Clock, Users, CheckCircle, XCircle, Trophy } from 'lucide-react';
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
}

interface Student {
  id: string;
  full_name: string;
  d_no: string;
  phone_no: string;
  email: string;
}

interface Attendance {
  student_id: string;
  lot_number: string;
  marks: number;
  is_present: boolean;
}

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignedEvents, setAssignedEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventParticipants, setEventParticipants] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignedEvents();
    }
  }, [user]);

  const fetchAssignedEvents = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.uid)
        .single();

      if (!profile) return;

      const { data: assignments } = await supabase
        .from('staff_assignments')
        .select(`
          events (
            id,
            title,
            description,
            date,
            time,
            location,
            capacity
          )
        `)
        .eq('staff_id', profile.id);

      if (assignments) {
        setAssignedEvents(assignments.map(a => a.events).filter(Boolean));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assigned events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventParticipants = async (eventId: string) => {
    try {
      const { data } = await supabase
        .from('event_registrations')
        .select(`
          profiles (
            id,
            full_name,
            d_no,
            phone_no,
            email
          )
        `)
        .eq('event_id', eventId);

      if (data) {
        const participants = data.map(r => r.profiles).filter(Boolean);
        setEventParticipants(participants);

        // Initialize attendance data
        const initialAttendance: Record<string, Attendance> = {};
        participants.forEach(participant => {
          initialAttendance[participant.id] = {
            student_id: participant.id,
            lot_number: '',
            marks: 0,
            is_present: false,
          };
        });
        setAttendanceData(initialAttendance);

        // Fetch existing attendance data
        const { data: existingAttendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('event_id', eventId);

        if (existingAttendance) {
          const attendanceMap: Record<string, Attendance> = {};
          existingAttendance.forEach(att => {
            attendanceMap[att.student_id] = {
              student_id: att.student_id,
              lot_number: att.lot_number || '',
              marks: att.marks || 0,
              is_present: att.is_present,
            };
          });
          setAttendanceData(prev => ({ ...prev, ...attendanceMap }));
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch event participants",
        variant: "destructive",
      });
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    fetchEventParticipants(event.id);
  };

  const updateAttendance = (studentId: string, field: keyof Attendance, value: any) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const saveAttendance = async (studentId: string) => {
    if (!selectedEvent) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.uid)
        .single();

      if (!profile) return;

      const attendance = attendanceData[studentId];
      
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          event_id: selectedEvent.id,
          staff_id: profile.id,
          lot_number: attendance.lot_number,
          marks: attendance.marks,
          is_present: attendance.is_present,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    }
  };

  const sortByLotNumber = () => {
    const sorted = [...eventParticipants].sort((a, b) => {
      const lotA = attendanceData[a.id]?.lot_number || '';
      const lotB = attendanceData[b.id]?.lot_number || '';
      return lotA.localeCompare(lotB);
    });
    setEventParticipants(sorted);
  };

  const getTopThreeStudents = () => {
    return [...eventParticipants]
      .filter(p => attendanceData[p.id]?.marks > 0)
      .sort((a, b) => {
        const marksA = attendanceData[a.id]?.marks || 0;
        const marksB = attendanceData[b.id]?.marks || 0;
        return marksB - marksA;
      })
      .slice(0, 3);
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
            Staff Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}! Manage your assigned events and track attendance.
          </p>
        </div>

        {!selectedEvent ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Assigned Events
                </CardTitle>
                <CardDescription>
                  Events you are assigned to manage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignedEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No events assigned to you yet.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {assignedEvents.map((event) => (
                      <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4" onClick={() => handleEventClick(event)}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            <Badge variant="outline">Assigned</Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{event.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm mt-2">
                            <Users className="h-4 w-4" />
                            Capacity: {event.capacity}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedEvent.title}</CardTitle>
                    <CardDescription>Manage attendance and marks</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={sortByLotNumber}>
                      Sort by Lot Number
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                      Back to Events
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Top 3 Students */}
            {getTopThreeStudents().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top 3 Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getTopThreeStudents().map((student, index) => (
                      <Card key={student.id} className="bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="pt-6 text-center">
                          <div className="text-4xl mb-2">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                          <h3 className="font-bold mb-1">{student.full_name}</h3>
                          <p className="text-2xl font-bold text-primary">
                            {attendanceData[student.id]?.marks || 0} marks
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Lot: {attendanceData[student.id]?.lot_number || 'N/A'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Event Participants
                </CardTitle>
                <CardDescription>
                  Mark attendance and assign marks for participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventParticipants.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No participants registered for this event.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>D.No</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Lot Number</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventParticipants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            {participant.full_name}
                          </TableCell>
                          <TableCell>{participant.d_no || 'N/A'}</TableCell>
                          <TableCell>{participant.phone_no || 'N/A'}</TableCell>
                          <TableCell>{participant.email}</TableCell>
                          <TableCell>
                            <Input
                              value={attendanceData[participant.id]?.lot_number || ''}
                              onChange={(e) => updateAttendance(participant.id, 'lot_number', e.target.value)}
                              placeholder="Enter lot number"
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={attendanceData[participant.id]?.marks || 0}
                              onChange={(e) => updateAttendance(participant.id, 'marks', parseInt(e.target.value) || 0)}
                              placeholder="Marks"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={attendanceData[participant.id]?.is_present || false}
                              onCheckedChange={(checked) => updateAttendance(participant.id, 'is_present', checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => saveAttendance(participant.id)}
                              size="sm"
                              className="h-8"
                            >
                              Save
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;