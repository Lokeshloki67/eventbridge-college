import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  maxParticipants: number;
  currentParticipants: number;
  isRegistrationOpen: boolean;
  image?: string;
}

interface EventCardProps {
  event: Event;
  onRegister: (eventId: string) => void;
  isRegistered?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRegister, isRegistered = false }) => {
  const isAvailable = event.currentParticipants < event.maxParticipants;
  
  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge 
            variant={event.category === 'Technical' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {event.category}
          </Badge>
          <Badge 
            variant={isAvailable ? 'success' : 'destructive'}
            className="text-xs"
          >
            {isAvailable ? 'Available' : 'Full'}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {event.date}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {event.time}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {event.venue}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {event.currentParticipants}/{event.maxParticipants} registered
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          variant={isRegistered ? "success" : "hero"}
          disabled={!event.isRegistrationOpen || (!isAvailable && !isRegistered)}
          onClick={() => !isRegistered && onRegister(event.id)}
        >
          {isRegistered 
            ? 'Registered ✓' 
            : !event.isRegistrationOpen 
            ? 'Registration Closed' 
            : !isAvailable 
            ? 'Event Full' 
            : 'Register Now'
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;