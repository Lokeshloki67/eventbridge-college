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
  secretaryName: string;
  secretaryDno: string;
  secretaryEmail: string;
  secretaryPhone: string;
  numberOfParticipants: number;
  teammates: TeamMember[];
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
    secretaryName: '',
    secretaryDno: '',
    secretaryEmail: '',
    secretaryPhone: '',
    numberOfParticipants: 1,
    teammates: []
  });

  const handleInputChange = (field: keyof RegistrationData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParticipantCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(5, count)); // Limit between 1-5
    const currentTeammates = formData.teammates;
    const newTeammates = [...currentTeammates];

    if (newCount > 1) {
      // Add new teammates if count increased
      while (newTeammates.length < newCount - 1) {
        newTeammates.push({ name: '', dno: '', phone: '' });
      }
      // Remove teammates if count decreased
      if (newTeammates.length > newCount - 1) {
        newTeammates.splice(newCount - 1);
      }
    } else {
      // If count is 1, clear all teammates
      newTeammates.length = 0;
    }

    setFormData(prev => ({
      ...prev,
      numberOfParticipants: newCount,
      teammates: newTeammates
    }));
  };

  const handleTeammateChange = (index: number, field: keyof TeamMember, value: string) => {
    const newTeammates = [...formData.teammates];
    newTeammates[index] = { ...newTeammates[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      teammates: newTeammates
    }));
  };

  const secretarySchema = z.object({
    secretaryName: z.string().trim().min(1, 'Secretary name is required').max(100, 'Name must be less than 100 characters'),
    secretaryDno: z.string().trim().min(1, 'Secretary D.No is required').max(50, 'D.No must be less than 50 characters'),
    secretaryEmail: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
    secretaryPhone: z.string().trim().regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits'),
  });

  const teammateSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    dno: z.string().trim().min(1, 'D.No is required').max(50, 'D.No must be less than 50 characters'),
    phone: z.string().trim().regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits'),
  });

  const validateForm = (): boolean => {
    // Validate secretary details
    try {
      secretarySchema.parse({
        secretaryName: formData.secretaryName,
        secretaryDno: formData.secretaryDno,
        secretaryEmail: formData.secretaryEmail,
        secretaryPhone: formData.secretaryPhone,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Error", description: error.errors[0].message, variant: "destructive" });
      }
      return false;
    }

    // Validate teammates
    for (let i = 0; i < formData.teammates.length; i++) {
      const teammate = formData.teammates[i];
      try {
        teammateSchema.parse(teammate);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({ title: "Error", description: `Teammate ${i + 1}: ${error.errors[0].message}`, variant: "destructive" });
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

      {/* Secretary Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Secretary Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="secretaryName">Secretary Name *</Label>
              <Input
                id="secretaryName"
                placeholder="Enter secretary name"
                value={formData.secretaryName}
                onChange={(e) => handleInputChange('secretaryName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretaryDno">D.No *</Label>
              <Input
                id="secretaryDno"
                placeholder="Enter D.No (e.g., 22001A05XX)"
                value={formData.secretaryDno}
                onChange={(e) => handleInputChange('secretaryDno', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="secretaryEmail">Email *</Label>
              <Input
                id="secretaryEmail"
                type="email"
                placeholder="Enter email address"
                value={formData.secretaryEmail}
                onChange={(e) => handleInputChange('secretaryEmail', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretaryPhone">Phone Number *</Label>
              <Input
                id="secretaryPhone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.secretaryPhone}
                onChange={(e) => handleInputChange('secretaryPhone', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participantCount">Number of Participants (including secretary) *</Label>
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
              <p className="text-sm text-muted-foreground">Maximum 5 participants allowed per team</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teammates Details */}
      {formData.numberOfParticipants > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Teammate Details ({formData.teammates.length} member{formData.teammates.length !== 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.teammates.map((teammate, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Teammate {index + 1}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`teammate-${index}-name`}>Name *</Label>
                    <Input
                      id={`teammate-${index}-name`}
                      placeholder="Enter teammate name"
                      value={teammate.name}
                      onChange={(e) => handleTeammateChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`teammate-${index}-dno`}>D.No *</Label>
                    <Input
                      id={`teammate-${index}-dno`}
                      placeholder="Enter D.No"
                      value={teammate.dno}
                      onChange={(e) => handleTeammateChange(index, 'dno', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`teammate-${index}-phone`}>Phone Number *</Label>
                    <Input
                      id={`teammate-${index}-phone`}
                      type="tel"
                      placeholder="Enter phone number"
                      value={teammate.phone}
                      onChange={(e) => handleTeammateChange(index, 'phone', e.target.value)}
                      required
                    />
                  </div>
                </div>
                {index < formData.teammates.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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