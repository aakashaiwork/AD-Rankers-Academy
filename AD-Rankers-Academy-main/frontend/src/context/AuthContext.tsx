import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setWebItem = (key: string, value: string) => {
    if (Platform.OS !== 'web') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  };

  const getWebItem = (key: string) => {
    if (Platform.OS !== 'web') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const removeWebItem = (key: string) => {
    if (Platform.OS !== 'web') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken =
        (await AsyncStorage.getItem('token')) || getWebItem('token');
      const storedUser = (await AsyncStorage.getItem('user')) || getWebItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Mock authentication - accept any email/password for demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const mockUser = {
        id: '1',
        email: email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        role: 'student'
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();

      setToken(mockToken);
      setUser(mockUser);
      
      // Store auth data
      await AsyncStorage.setItem('token', mockToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      // Web storage
      setWebItem('token', mockToken);
      setWebItem('user', JSON.stringify(mockUser));
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role: 'student' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setWebItem('token', data.token);
      setWebItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    removeWebItem('token');
    removeWebItem('user');
    setToken(null);
    setUser(null);

    if (Platform.OS === 'web') {
      window.location.assign('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
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
