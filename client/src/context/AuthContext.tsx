import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../utils/auth';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = () => {
      const loggedIn = AuthService.loggedIn();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        try {
          const profile: any = AuthService.getProfile();
          if (profile && profile.data) {
            setUser({
              _id: profile.data._id,
              username: profile.data.username,
              email: profile.data.email,
            });
          }
        } catch (error) {
          console.error('Error getting user profile:', error);
          AuthService.logout();
        }
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  const login = (token: string) => {
    AuthService.login(token);
  };

  const logout = () => {
    AuthService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};