'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from './api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('indexflow_token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      if (pathname.startsWith('/dashboard')) router.push('/login');
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      setUser(null);
      if (pathname.startsWith('/dashboard')) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const login = async (e: string, p: string) => {
    const data = await api.login(e, p);
    setUser(data.user);
    router.push('/dashboard');
  };

  const register = async (n: string, e: string, p: string) => {
    const data = await api.register(n, e, p);
    setUser(data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    api.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
