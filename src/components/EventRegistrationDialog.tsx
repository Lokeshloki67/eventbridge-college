import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Event } from '@/components/EventCard';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Trophy,
  Info
} from 'lucide-react';

interface EventRegistrationDialogProps {
  event: Event;
  children: React.ReactNode;
  onRegister: (eventId: string, registrationData: any) => void;
  isRegistered?: boolean;
}

const EventRegistrationDialog: React.FC<EventRegistrationDialogProps> = ({
  event,
  children,
  onRegister,
  isRegistered = false
}) => {
  const [showForm, setShowForm] = useState(false);
  const isAvailable = event.currentParticipants < event.maxParticipants;

  const rulesAndRegulations = [
    "Registration is mandatory for all participants",
    "Each team can have maximum 5 participants",
    "Secretary must be present during the event",
    "Valid student ID is required for verification",
    "Registration closes 24 hours before the event",
    "No refunds after registration confirmation",
    "Participants must follow college code of conduct",
    "Event timings are strictly adhered to"
  ];

  const handleRegistration = (registrationData: any) => {
    onRegister(event.id, registrationData);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <Dialog open onOpenChange={() => setShowForm(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Register for {event.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <EventRegistrationForm
              event={event}
              onSubmit={handleRegistration}
              onCancel={() => setShowForm(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {event.title}
            <Badge variant={event.category === 'Technical' ? 'default' : 'secondary'}>
              {event.category}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Event Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.currentParticipants}/{event.maxParticipants} registered</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant={isAvailable ? 'success' : 'destructive'}>
                  {isAvailable ? 'Available' : 'Full'}
                </Badge>
                <Badge variant={event.isRegistrationOpen ? 'success' : 'destructive'}>
                  {event.isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Event Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Event Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            <Separator />

            {/* Rules and Regulations */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Rules & Regulations
              </h3>
              <ul className="space-y-2">
                {rulesAndRegulations.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-semibold mt-0.5">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Event Benefits */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Event Benefits
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold mt-0.5">•</span>
                  <span>Certificate of participation for all attendees</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold mt-0.5">•</span>
                  <span>Winners will receive cash prizes and trophies</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold mt-0.5">•</span>
                  <span>Networking opportunities with industry experts</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold mt-0.5">•</span>
                  <span>Extra credit points for course evaluation</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 mt-6">
          <Button
            variant="hero"
            className="w-full"
            disabled={!event.isRegistrationOpen || (!isAvailable && !isRegistered) || isRegistered}
            onClick={() => onRegister(event.id, {})}
          >
            {isRegistered 
              ? 'Already Registered ✓' 
              : !event.isRegistrationOpen 
              ? 'Registration Closed' 
              : !isAvailable 
              ? 'Event Full' 
              : 'Register Now'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationDialog;