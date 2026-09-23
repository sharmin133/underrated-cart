import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, clearToken, getUserId, saveUserId } from '../utils/storage';

type AuthContextValue = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  userId: number | null;
  login: (token: string, userId: number) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const storedUserId = await getUserId();
      setIsAuthenticated(!!token);
      setUserId(storedUserId);
      setIsBootstrapping(false);
    })();
  }, []);

  const login = async (token: string, newUserId: number) => {
    await saveToken(token);
    await saveUserId(newUserId);
    setUserId(newUserId);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await clearToken();
    setUserId(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isBootstrapping, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}