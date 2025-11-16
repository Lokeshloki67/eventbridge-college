import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DemoDataButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const setupDemoData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-demo-data', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Demo data has been created. You can now login with the demo credentials shown below.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Setup Demo Data",
        description: "Please create demo users manually in Supabase. Check DEMO_SETUP.md for instructions.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={setupDemoData}
      disabled={loading}
      className="w-full"
    >
      <Database className="mr-2 h-4 w-4" />
      {loading ? 'Setting up...' : 'Setup Demo Data'}
    </Button>
  );
};

export default DemoDataButton;
