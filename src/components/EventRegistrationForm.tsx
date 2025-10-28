import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/components/EventCard';
import { useToast } from '@/hooks/use-toast';
import { User, Users, Plus, Minus } from 'lucide-react';
import { z } from 'zod';

interface TeamMember {
  name: string;
  dno: string;
  phone: string;
}

interface RegistrationData {
  numberOfParticipants: number;
  participants: TeamMember[];
}

interface EventRegistrationFormProps {
  event: Event;
  onSubmit: (data: RegistrationData) => void;
  onCancel: () => void;
}

const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({
  event,
  onSubmit,
  onCancel
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RegistrationData>({
    numberOfParticipants: 1,
    participants: [{ name: '', dno: '', phone: '' }]
  });

  const handleInputChange = (field: keyof RegistrationData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParticipantCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(5, count));
    const currentParticipants = formData.participants;
    const newParticipants = [...currentParticipants];

    while (newParticipants.length < newCount) {
      newParticipants.push({ name: '', dno: '', phone: '' });
    }
    if (newParticipants.length > newCount) {
      newParticipants.splice(newCount);
    }

    setFormData(prev => ({
      ...prev,
      numberOfParticipants: newCount,
      participants: newParticipants
    }));
  };

  const handleParticipantChange = (index: number, field: keyof TeamMember, value: string) => {
    const newParticipants = [...formData.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      participants: newParticipants
    }));
  };

  const participantSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    dno: z.string().trim().min(1, 'D.No is required').max(50, 'D.No must be less than 50 characters'),
    phone: z.string().trim().regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits'),
  });

  const validateForm = (): boolean => {
    for (let i = 0; i < formData.participants.length; i++) {
      const participant = formData.participants[i];
      try {
        participantSchema.parse(participant);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({ title: "Error", description: `Participant ${i + 1}: ${error.errors[0].message}`, variant: "destructive" });
        }
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Registering for: {event.title}
            <Badge variant="secondary">{event.category}</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Participant Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Number of Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participantCount">How many participants? *</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleParticipantCountChange(formData.numberOfParticipants - 1)}
                  disabled={formData.numberOfParticipants <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="participantCount"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.numberOfParticipants}
                  onChange={(e) => handleParticipantCountChange(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleParticipantCountChange(formData.numberOfParticipants + 1)}
                  disabled={formData.numberOfParticipants >= 5}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Maximum 5 participants allowed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participant Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Participant Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.participants.map((participant, index) => (
            <div key={index}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">Participant {index + 1}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`participant-${index}-name`}>Name *</Label>
                  <Input
                    id={`participant-${index}-name`}
                    placeholder="Enter participant name"
                    value={participant.name}
                    onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`participant-${index}-dno`}>D.No *</Label>
                  <Input
                    id={`participant-${index}-dno`}
                    placeholder="Enter D.No"
                    value={participant.dno}
                    onChange={(e) => handleParticipantChange(index, 'dno', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`participant-${index}-phone`}>Phone Number *</Label>
                  <Input
                    id={`participant-${index}-phone`}
                    type="tel"
                    placeholder="Enter phone number"
                    value={participant.phone}
                    onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                    required
                  />
                </div>
              </div>
              {index < formData.participants.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="hero" className="flex-1">
          Submit Registration
        </Button>
      </div>
    </form>
  );
};

export default EventRegistrationForm;