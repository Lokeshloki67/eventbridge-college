import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import EventCard, { Event } from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
  
  // Mock data - in real app, this would come from Firebase
  const [registeredEvents, setRegisteredEvents] = useState<string[]>(['1', '3']);
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Tech Symposium 2024',
      description: 'Annual technical symposium featuring workshops, hackathons, and industry talks',
      category: 'Technical',
      date: '2024-03-15',
      time: '9:00 AM',
      venue: 'Main Auditorium',
      maxParticipants: 500,
      currentParticipants: 342,
      isRegistrationOpen: true
    },
    {
      id: '2',
      title: 'Cultural Fest',
      description: 'Celebrate diversity through music, dance, and cultural performances',
      category: 'Cultural',
      date: '2024-03-20',
      time: '6:00 PM',
      venue: 'Open Grounds',
      maxParticipants: 1000,
      currentParticipants: 678,
      isRegistrationOpen: true
    },
    {
      id: '3',
      title: 'Startup Bootcamp',
      description: 'Learn from successful entrepreneurs and pitch your ideas',
      category: 'Workshop',
      date: '2024-03-25',
      time: '10:00 AM',
      venue: 'Innovation Hub',
      maxParticipants: 100,
      currentParticipants: 95,
      isRegistrationOpen: true
    },
    {
      id: '4',
      title: 'Sports Day',
      description: 'Annual sports competition with various athletic events',
      category: 'Sports',
      date: '2024-03-30',
      time: '7:00 AM',
      venue: 'Sports Complex',
      maxParticipants: 300,
      currentParticipants: 156,
      isRegistrationOpen: true
    }
  ]);

  const handleEventRegister = (eventId: string, registrationData: any) => {
    if (registeredEvents.includes(eventId)) {
      toast({
        title: "Already Registered",
        description: "You are already registered for this event",
        variant: "destructive"
      });
      return;
    }

    // Store registration data in localStorage (in real app, this would go to Firebase)
    const existingRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    const newRegistration = {
      eventId,
      ...registrationData,
      registrationDate: new Date().toISOString()
    };
    localStorage.setItem('eventRegistrations', JSON.stringify([...existingRegistrations, newRegistration]));

    setRegisteredEvents([...registeredEvents, eventId]);
    toast({
      title: "Registration Successful!",
      description: `You have been registered for the event with ${registrationData.numberOfParticipants} participant(s)`,
      variant: "default"
    });
  };

  const myEvents = events.filter(event => registeredEvents.includes(event.id));
  const availableEvents = events.filter(event => !registeredEvents.includes(event.id));

  const stats = [
    { label: 'Registered Events', value: registeredEvents.length, icon: Calendar, color: 'text-primary' },
    { label: 'Completed Events', value: '2', icon: CheckCircle, color: 'text-success' },
    { label: 'Upcoming Events', value: registeredEvents.length.toString(), icon: Clock, color: 'text-accent' },
    { label: 'Achievements', value: '5', icon: Trophy, color: 'text-destructive' }
  ];

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
                    <EventCard
                      key={event.id}
                      event={event}
                      onRegister={() => {}}
                      isRegistered={true}
                    />
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