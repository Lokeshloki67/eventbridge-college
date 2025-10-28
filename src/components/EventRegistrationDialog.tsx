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
...
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