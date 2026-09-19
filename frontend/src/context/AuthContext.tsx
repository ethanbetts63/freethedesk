'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  AUTH_FAILURE_EVENT,
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  type Principal,
} from '@/lib/api';

interface AuthValue {
  user: Principal | null;
  loading: boolean;

  login: (identifier: string, password: string) => Promise<Principal>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Principal | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * The cookies are the session. There used to be a `hasSession` flag in
   * localStorage here, checked before asking the API who you are, so a signed-
   * out visitor was spared one request -- but it was a second copy of a fact
   * only the server can answer, and the two went out of step in both
   * directions: a cleared cookie left the flag behind, and a session started in
   * another tab was invisible until this one wrote it. The saving was one
   * request on first load.
   */
  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((result) => {
        if (!cancelled) setUser(result);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const failed = () => setUser(null);
    window.addEventListener(AUTH_FAILURE_EVENT, failed);
    return () => window.removeEventListener(AUTH_FAILURE_EVENT, failed);
  }, []);

  async function login(identifier: string, password: string) {
    const principal = await loginRequest(identifier, password);
    setUser(principal);
    setLoading(false);
    return principal;
  }

  async function logout() {
    await logoutRequest().catch(() => undefined);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
