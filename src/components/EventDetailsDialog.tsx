import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Event } from '@/components/EventCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import { z } from 'zod';

interface Participant {
  name: string;
  dno: string;
  phone: string;
}

interface EventDetailsDialogProps {
  event: Event;
  children: React.ReactNode;
  registrationId?: string;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  children,
  registrationId
}) => {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedParticipants, setEditedParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (registrationId) {
      fetchRegistrationDetails();
    }
  }, [registrationId]);

  const fetchRegistrationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('registration_data')
        .eq('id', registrationId)
        .single();

      if (error) throw error;

      if (data?.registration_data) {
        const regData = data.registration_data as any;
        if (regData?.participants && Array.isArray(regData.participants)) {
          setParticipants(regData.participants);
          setEditedParticipants(regData.participants);
        }
      }
    } catch (error) {
      console.error('Error fetching registration:', error);
    } finally {
      setLoading(false);
    }
  };

  const participantSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    dno: z.string().trim().min(1, 'D.No is required').max(50),
    phone: z.string().trim().regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits'),
  });

  const handleAddParticipant = () => {
    setEditedParticipants([...editedParticipants, { name: '', dno: '', phone: '' }]);
  };

  const handleRemoveParticipant = (index: number) => {
    const updated = editedParticipants.filter((_, i) => i !== index);
    setEditedParticipants(updated);
  };

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    const updated = [...editedParticipants];
    updated[index] = { ...updated[index], [field]: value };
    setEditedParticipants(updated);
  };

  const handleSave = async () => {
    try {
      // Validate all participants
      for (let i = 0; i < editedParticipants.length; i++) {
        try {
          participantSchema.parse(editedParticipants[i]);
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast({
              title: "Validation Error",
              description: `Participant ${i + 1}: ${error.errors[0].message}`,
              variant: "destructive"
            });
          }
          return;
        }
      }

      const { error } = await supabase
        .from('event_registrations')
        .update({
          registration_data: {
            participants: editedParticipants,
            numberOfParticipants: editedParticipants.length
          } as any
        })
        .eq('id', registrationId);

      if (error) throw error;

      setParticipants(editedParticipants);
      setEditMode(false);
      toast({
        title: "Success",
        description: "Participant details updated successfully"
      });
    } catch (error) {
      console.error('Error updating registration:', error);
      toast({
        title: "Error",
        description: "Failed to update participant details",
        variant: "destructive"
      });
    }
  };

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
          <DialogDescription>
            View and manage your event registration details
          </DialogDescription>
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
                  <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Participants List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registered Participants
                </h3>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : editMode ? (
                <div className="space-y-4">
                  {editedParticipants.map((participant, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="outline">Participant {index + 1}</Badge>
                          {editedParticipants.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveParticipant(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={participant.name}
                              onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                              placeholder="Enter name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>D.No</Label>
                            <Input
                              value={participant.dno}
                              onChange={(e) => handleParticipantChange(index, 'dno', e.target.value)}
                              placeholder="Enter D.No"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={participant.phone}
                              onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                              placeholder="Enter phone"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleAddParticipant}
                    disabled={editedParticipants.length >= 5}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Participant
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <Badge variant="outline" className="mb-3">Participant {index + 1}</Badge>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <p className="font-medium">{participant.name}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">D.No:</span>
                            <p className="font-medium">{participant.dno}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <p className="font-medium">{participant.phone}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {editMode && (
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => {
              setEditedParticipants(participants);
              setEditMode(false);
            }}>
              Cancel
            </Button>
            <Button variant="hero" className="flex-1" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
