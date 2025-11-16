import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Shield, UserCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import DemoDataButton from '@/components/DemoDataButton';

const LoginPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>('student');
  
  const { login, signup, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff-dashboard');
      } else if (user.role === 'student') {
        navigate('/student-dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignup && !fullName)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, fullName, activeTab);
        toast({
          title: "Success",
          description: "Account created! Please check your email to verify your account.",
          variant: "default"
        });
      } else {
        await login(email, password);
        toast({
          title: "Success",
          description: "Login successful!",
          variant: "default"
        });
      }
    } catch (error: any) {
      toast({
        title: isSignup ? "Signup Failed" : "Login Failed",
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
      label: 'Student',
      icon: GraduationCap,
      description: isSignup ? 'Create a student account' : 'Access your student dashboard'
    },
    {
      value: 'staff' as UserRole,
      label: 'Staff',
      icon: UserCheck,
      description: isSignup ? 'Create a staff account' : 'Manage event attendance'
    },
    {
      value: 'admin' as UserRole,
      label: 'Admin',
      icon: Shield,
      description: isSignup ? 'Create an admin account' : 'System administration'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-white/80">
            {isSignup ? 'Sign up for a new account' : 'Sign in to your account'}
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">
              {isSignup ? 'Choose Account Type' : 'Choose Login Type'}
            </CardTitle>
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
                    <h3 className="text-lg font-semibold">{tab.label} {isSignup ? 'Signup' : 'Login'}</h3>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                  </div>

                  {!isSignup && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <p className="text-xs font-semibold mb-2 text-center">Demo Credentials</p>
                      <div className="text-xs space-y-1">
                        {tab.value === 'student' && (
                          <>
                            <p><span className="font-medium">Email:</span> student@college.edu</p>
                            <p><span className="font-medium">Password:</span> student123</p>
                          </>
                        )}
                        {tab.value === 'staff' && (
                          <>
                            <p><span className="font-medium">Email:</span> staff@college.edu</p>
                            <p><span className="font-medium">Password:</span> staff123</p>
                          </>
                        )}
                        {tab.value === 'admin' && (
                          <>
                            <p><span className="font-medium">Email:</span> admin@college.edu</p>
                            <p><span className="font-medium">Password:</span> admin123</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignup && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    
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
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-sm text-primary hover:underline"
                      >
                        {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                      </button>
                    </div>
                  </form>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6 space-y-3">
              {!isSignup && <DemoDataButton />}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
