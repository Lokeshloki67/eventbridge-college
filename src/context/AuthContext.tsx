import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'student' | 'staff' | 'admin';

export interface AuthUser {
  email: string;
  role: UserRole;
  uid: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo users for localStorage authentication
  const demoUsers = {
    'student@college.edu': { password: 'password123', role: 'student' as UserRole },
    'alex.thompson@student.edu': { password: 'student123', role: 'student' as UserRole },
    'jessica.liu@student.edu': { password: 'student123', role: 'student' as UserRole },
    'ryan.patel@student.edu': { password: 'student123', role: 'student' as UserRole },
    'maria.garcia@student.edu': { password: 'student123', role: 'student' as UserRole },
    'james.wilson@student.edu': { password: 'student123', role: 'student' as UserRole },
    'staff@college.edu': { password: 'staff123', role: 'staff' as UserRole },
    'michael.chen@college.edu': { password: 'staff123', role: 'staff' as UserRole },
    'emily.rodriguez@college.edu': { password: 'staff123', role: 'staff' as UserRole },
    'david.kim@college.edu': { password: 'staff123', role: 'staff' as UserRole },
    'admin@college.edu': { password: 'admin123', role: 'admin' as UserRole }
  };

  useEffect(() => {
    // Check localStorage for existing user session
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const demoUser = demoUsers[email as keyof typeof demoUsers];
      
      if (!demoUser || demoUser.password !== password || demoUser.role !== role) {
        throw new Error('Invalid credentials or role');
      }

      // Generate unique UIDs for demo users
      const uidMap: { [key: string]: string } = {
        'admin@college.edu': 'admin-demo-uid-001',
        'staff@college.edu': 'staff-demo-uid-001',
        'student@college.edu': 'student-demo-uid-001',
        'michael.chen@college.edu': 'staff-demo-uid-002',
        'emily.rodriguez@college.edu': 'staff-demo-uid-003',
        'david.kim@college.edu': 'staff-demo-uid-004',
        'alex.thompson@student.edu': 'student-demo-uid-002',
        'jessica.liu@student.edu': 'student-demo-uid-003',
        'ryan.patel@student.edu': 'student-demo-uid-004',
        'maria.garcia@student.edu': 'student-demo-uid-005',
        'james.wilson@student.edu': 'student-demo-uid-006'
      };
      const uid = uidMap[email] || `demo-${Date.now()}`;

      const authUser: AuthUser = {
        email,
        role: demoUser.role,
        uid
      };

      setUser(authUser);
      localStorage.setItem('authUser', JSON.stringify(authUser));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};