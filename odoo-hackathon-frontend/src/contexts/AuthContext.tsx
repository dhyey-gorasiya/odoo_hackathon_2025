import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('expense_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const mockUser: User = {
      id: '1',
      company_id: '1',
      email,
      full_name: 'Demo User',
      role: 'employee',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (email.includes('admin')) {
      mockUser.role = 'admin';
      mockUser.full_name = 'Admin User';
    } else if (email.includes('manager')) {
      mockUser.role = 'manager';
      mockUser.full_name = 'Manager User';
    }

    localStorage.setItem('expense_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    const mockUser: User = {
      id: '1',
      company_id: '1',
      email,
      full_name: fullName,
      role: companyName ? 'admin' : 'employee',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem('expense_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signOut = () => {
    localStorage.removeItem('expense_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
