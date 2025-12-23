import { createContext, useContext, useState, ReactNode } from 'react';
import { adminApi } from '../lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return adminApi.hasCredentials();
  });

  async function login(username: string, password: string): Promise<boolean> {
    const success = await adminApi.login(username, password);
    if (success) {
      setIsAuthenticated(true);
    }
    return success;
  }

  function logout() {
    adminApi.clearCredentials();
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
