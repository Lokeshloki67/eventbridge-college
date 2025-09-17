import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Shield, UserCheck, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>('student');
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password, activeTab);
      toast({
        title: "Success",
        description: "Login successful!",
        variant: "default"
      });
      navigate(`/${activeTab}-dashboard`);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loginTabs = [
    {
      value: 'student' as UserRole,
      label: 'Student Login',
      icon: GraduationCap,
      description: 'Access your student dashboard and register for events'
    },
    {
      value: 'admin' as UserRole,
      label: 'Admin Login',
      icon: Shield,
      description: 'Manage events, users, and system administration'
    },
    {
      value: 'incharge' as UserRole,
      label: 'Incharge Login',
      icon: UserCheck,
      description: 'Manage event attendance and student records'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/80">Sign in to your account</p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Choose Login Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                {loginTabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="text-xs"
                  >
                    <tab.icon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{tab.value}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {loginTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                  <div className="text-center mb-4">
                    <tab.icon className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h3 className="text-lg font-semibold">{tab.label}</h3>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      variant="hero"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : `Sign in as ${tab.value}`}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-sm"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-4 bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p><strong>Student:</strong> student@college.edu / password123</p>
              <p><strong>Admin:</strong> admin@college.edu / admin123</p>
              <p><strong>Incharge:</strong> incharge@college.edu / incharge123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;