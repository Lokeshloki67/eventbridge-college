import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EventCard, { Event } from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Code, 
  Music, 
  BookOpen,
  Star,
  Award,
  Target
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock events data
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
    }
  ]);

  const handleEventRegister = (eventId: string) => {
    navigate('/login');
  };

  const categories = [
    { name: 'Technical', icon: Code, color: 'text-primary' },
    { name: 'Cultural', icon: Music, color: 'text-accent' },
    { name: 'Workshop', icon: BookOpen, color: 'text-success' },
    { name: 'Sports', icon: Trophy, color: 'text-destructive' }
  ];

  const stats = [
    { label: 'Total Events', value: '50+', icon: Calendar },
    { label: 'Registered Students', value: '2,500+', icon: Users },
    { label: 'Success Rate', value: '98%', icon: Target },
    { label: 'Awards Won', value: '25+', icon: Award }
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
                St. Xavier's College
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

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
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
        </div>
      </section>

      {/* College Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About St. Xavier's College</h2>
              <p className="text-lg text-muted-foreground mb-6">
                With over 50 years of academic excellence, St. Xavier's College has been nurturing young minds 
                and fostering innovation. Our vibrant campus life includes numerous events, competitions, 
                and cultural activities that shape well-rounded individuals.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <span>123 College Street, Academic City, State - 123456</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-3" />
                  <span>Established in 1970</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-3" />
                  <span>5000+ Active Students</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-hero rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <strong>Phone:</strong> +91 (123) 456-7890
                </div>
                <div>
                  <strong>Email:</strong> info@stxaviers.edu
                </div>
                <div>
                  <strong>Website:</strong> www.stxaviers.edu
                </div>
                <div>
                  <strong>Admissions:</strong> admissions@stxaviers.edu
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
            <p className="text-lg font-medium mb-2">St. Xavier's College Event Management System</p>
            <p className="text-primary-foreground/80">
              © 2024 St. Xavier's College. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;