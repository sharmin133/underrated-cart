import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, clearToken } from '../utils/storage';

type AuthContextValue = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);
      setIsBootstrapping(false);
    })();
  }, []);

  const login = async (token: string) => {
    await saveToken(token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await clearToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isBootstrapping, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}