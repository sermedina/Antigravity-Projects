import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<any>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  requestRecovery: (email: string) => Promise<any>;
  resetPassword: (token: string, newPass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('user_token');
        const storedUser = await AsyncStorage.getItem('user_data');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          try {
            const freshUser = await userService.getProfile();
            setUser(freshUser);
            await AsyncStorage.setItem('user_data', JSON.stringify(freshUser));
          } catch (err: any) {
            if (err.response?.status === 401) {
              await cleanSession();
            }
          }
        }
      } catch (e) {
        console.error('Error loading session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const cleanSession = async () => {
    await SecureStore.deleteItemAsync('user_token');
    await AsyncStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(username, pass);
      setToken(data.token);
      await SecureStore.setItemAsync('user_token', data.token);
      
      const freshUser = await userService.getProfile();
      setUser(freshUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(freshUser));
    } catch (error) {
      await cleanSession();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    return await authService.register(data);
  };

  const verifyEmail = async (email: string, token: string) => {
    await authService.verifyEmail(email, token);
  };

  const requestRecovery = async (email: string) => {
    return await authService.requestPasswordRecovery(email);
  };

  const resetPassword = async (tokenStr: string, newPass: string) => {
    await authService.resetPassword(tokenStr, newPass);
  };

  const logout = async () => {
    setIsLoading(true);
    await cleanSession();
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    try {
      const freshUser = await userService.getProfile();
      setUser(freshUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(freshUser));
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyEmail,
        requestRecovery,
        resetPassword,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
