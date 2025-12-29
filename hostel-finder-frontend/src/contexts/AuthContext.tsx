import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string, contactNumber?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('hostelgo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const userData = { ...response.user, email };
    setUser(userData);
    localStorage.setItem('hostelgo_user', JSON.stringify(userData));
    localStorage.setItem('hostelgo_password', password);
  };

  const signup = async (name: string, email: string, password: string, role: string, contactNumber?: string) => {
    const response = await authApi.signup(name, email, password, role, contactNumber);
    const userData = { ...response.user, email };
    setUser(userData);
    localStorage.setItem('hostelgo_user', JSON.stringify(userData));
    localStorage.setItem('hostelgo_password', password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostelgo_user');
    localStorage.removeItem('hostelgo_password');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
