import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EventCard, { Event } from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Code, 
  Music, 
  BookOpen,
  Star
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        // Get registration counts for each event
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

  const handleEventRegister = (eventId: string) => {
    navigate('/login');
  };

  const categories = [
    { name: 'Technical', icon: Code, color: 'text-primary' },
    { name: 'Cultural', icon: Music, color: 'text-accent' },
    { name: 'Workshop', icon: BookOpen, color: 'text-success' },
    { name: 'Sports', icon: Trophy, color: 'text-destructive' }
  ];


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to{' '}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                St. Joseph's College
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join exciting events, showcase your talents, and be part of our vibrant college community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => navigate('/login')}
              >
                <Star className="mr-2 h-5 w-5" />
                Explore Events
              </Button>
              <Button 
                variant="outline" 
                size="xl"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Event Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Categories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover events across various categories that match your interests
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group hover:shadow-primary transition-all duration-300 cursor-pointer">
                <CardContent className="flex flex-col items-center p-6">
                  <category.icon className={`h-12 w-12 mb-4 ${category.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Events</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't miss out on these exciting upcoming events
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.slice(0, 6).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={handleEventRegister}
                  />
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  View All Events
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* College Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About St. Joseph's College</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Established in 1844 by the Society of Jesus, St. Joseph's College is regarded as one of the most 
                prestigious institutions in India. As an autonomous and affiliated first-grade college of 
                Bharathidasan University, we continue our legacy of academic excellence and holistic development.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <span>Annamalai Nagar, Woraiyur, Tiruchirappalli, Tamil Nadu 620002</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-3" />
                  <span>Established in 1844</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-3" />
                  <span>7,236+ Active Students</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-hero rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <strong>Phone:</strong> 0431 270 0320
                </div>
                <div>
                  <strong>Email:</strong> info@sjctni.edu
                </div>
                <div>
                  <strong>Website:</strong> www.sjctni.edu
                </div>
                <div>
                  <strong>Campus:</strong> 76 acres (30.8 ha)
                </div>
                <div>
                  <strong>Affiliation:</strong> Bharathidasan University
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">St. Joseph's College Event Management System</p>
            <p className="text-primary-foreground/80">
              © 2024 St. Joseph's College, Tiruchirappalli. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;