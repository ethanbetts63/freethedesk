"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  AUTH_FAILURE_EVENT,
  SESSION_FLAG,
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  type Principal,
} from "@/lib/api";

interface AuthValue {
  user: Principal | null;
  loading: boolean;
  /** Resolves with the signed-in principal so callers can route by role. */
  login: (identifier: string, password: string) => Promise<Principal>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Principal | null>(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(() => {
    localStorage.removeItem(SESSION_FLAG);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const profile = localStorage.getItem(SESSION_FLAG) ? getProfile() : Promise.resolve(null);
    profile
      .then((result) => { if (!cancelled) setUser(result); })
      .catch(() => { if (!cancelled) clear(); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clear]);

  useEffect(() => {
    const failed = () => setUser(null);
    window.addEventListener(AUTH_FAILURE_EVENT, failed);
    return () => window.removeEventListener(AUTH_FAILURE_EVENT, failed);
  }, []);

  async function login(identifier: string, password: string) {
    const principal = await loginRequest(identifier, password);
    localStorage.setItem(SESSION_FLAG, "1");
    setUser(principal);
    setLoading(false);
    return principal;
  }

  async function logout() {
    localStorage.removeItem(SESSION_FLAG);
    await logoutRequest().catch(() => undefined);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
