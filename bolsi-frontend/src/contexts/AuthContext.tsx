import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('bolsi_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('bolsi_token')
  );

  useEffect(() => {
    if (user) localStorage.setItem('bolsi_user', JSON.stringify(user));
    else localStorage.removeItem('bolsi_user');
  }, [user]);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('bolsi_token', newToken);
    localStorage.setItem('bolsi_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('bolsi_token');
    localStorage.removeItem('bolsi_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role: string) => user?.roles?.includes(role) ?? false;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
