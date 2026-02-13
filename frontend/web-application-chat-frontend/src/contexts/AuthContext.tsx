// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/auth';

// Types
interface User {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
  tokenType: string;
  expiresIn: number;
  sessionId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialiser l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Vérifier si le token est toujours valide
          const response = await authApi.validateToken(storedToken);
          if (!response.data.data.isValid) {
            clearAuth();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          clearAuth();
        }
      }
    };
    
    initAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      
      if (response.data.success) {
        const authData: AuthResponse = response.data.data;
        
        // Stocker les données
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        // Mettre à jour l'état
        setToken(authData.token);
        setUser(authData.user);
        
        // Rediriger vers la page demandée ou chat
        navigate('/chat');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    clearAuth();
    navigate('/login');
  };

  const register = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(email, password);
      
      if (response.data.success) {
        // Auto-login après inscription
        await login(email, password);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      const response = await authApi.checkEmail(email);
      return response.data.data.available;
    } catch (error) {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    register,
    checkEmailAvailability,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};