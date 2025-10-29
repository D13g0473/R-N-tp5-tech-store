import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userAPI } from '../services/api';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const profile = await userAPI.getProfile();
          setUser(profile);
        }
      } catch (error) {
        await AsyncStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    await AsyncStorage.setItem('token', response.jwt);
    setUser(response.user);
  };

  const register = async (email: string, password: string) => {
    const response = await authAPI.register(email, password);
    await AsyncStorage.setItem('token', response.jwt);
    setUser(response.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role?.name === 'admin' || user?.role?.type === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};