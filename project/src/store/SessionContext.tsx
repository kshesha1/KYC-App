import React, { createContext, useContext, useState, useEffect } from 'react';
import { users } from '../data/hardcodedUsers';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface SessionContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('kycUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password, ...userData } = found;
      setUser(userData);
      localStorage.setItem('kycUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kycUser');
  };

  return (
    <SessionContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}; 