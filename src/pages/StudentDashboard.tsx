import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import EventCard, { Event } from '@/components/EventCard';
import EventDetailsDialog from '@/components/EventDetailsDialog';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Trophy, 
  Clock, 
  CheckCircle,
  Users,
  Star
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [registrationIds, setRegistrationIds] = useState<{ [eventId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchEvents();
      fetchRegisteredEvents();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.uid)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        const eventsWithCounts = await Promise.all(
          data.map(async (event) => {
            const { count } = await supabase
              .from('event_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id);

            return {
              id: event.id,
              title: event.title,
              description: event.description || '',
              category: 'Event',
              date: event.date,
              time: event.time,
              venue: event.location || 'TBA',
              maxParticipants: event.capacity || 100,
              currentParticipants: count || 0,
              isRegistrationOpen: true
            };
          })
        );
        setEvents(eventsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id, event_id')
        .eq('user_id', userProfile.id);

      if (error) throw error;
      if (data) {
        setRegisteredEvents(data.map(reg => reg.event_id));
        const idMap: { [eventId: string]: string } = {};
        data.forEach(reg => {
          idMap[reg.event_id] = reg.id;
        });
        setRegistrationIds(idMap);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleEventRegister = async (eventId: string, registrationData: any) => {
    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "Please log in to register for events",
        variant: "destructive"
      });
      return;
    }

    if (registeredEvents.includes(eventId)) {
      toast({
        title: "Already Registered",
        description: "You are already registered for this event",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userProfile.id,
          registration_data: registrationData
        });

      if (error) throw error;

      setRegisteredEvents([...registeredEvents, eventId]);
      toast({
        title: "Registration Successful!",
        description: `You have been registered for the event`,
        variant: "default"
      });
      
      // Refresh events to update participant count
      fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for the event",
        variant: "destructive"
      });
    }
  };

  const myEvents = events.filter(event => registeredEvents.includes(event.id));
  const availableEvents = events.filter(event => !registeredEvents.includes(event.id));

  const stats = [
    { label: 'Registered Events', value: registeredEvents.length, icon: Calendar, color: 'text-primary' },
    { label: 'Completed Events', value: '2', icon: CheckCircle, color: 'text-success' },
    { label: 'Upcoming Events', value: registeredEvents.length.toString(), icon: Clock, color: 'text-accent' },
    { label: 'Achievements', value: '5', icon: Trophy, color: 'text-destructive' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-hero bg-clip-text text-transparent">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-muted-foreground">Manage your event registrations and track your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-primary transition-all duration-300">
              <CardContent className="pt-6">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-events" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>My Events</span>
            </TabsTrigger>
            <TabsTrigger value="available" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Available Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-events" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">My Registered Events</h2>
              {myEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.map((event) => (
                    <EventDetailsDialog
                      key={event.id}
                      event={event}
                      registrationId={registrationIds[event.id]}
                    >
                      <div>
                        <EventCard
                          event={event}
                          onRegister={() => {}}
                          isRegistered={true}
                        />
                      </div>
                    </EventDetailsDialog>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Registered Events</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't registered for any events yet
                    </p>
                    <Button variant="hero" onClick={() => {
                      const tab = document.querySelector('[value="available"]') as HTMLElement;
                      tab?.click();
                    }}>
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Events</h2>
              {availableEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRegister={handleEventRegister}
                      isRegistered={false}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                    <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">
                      You've registered for all available events
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;