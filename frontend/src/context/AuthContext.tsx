"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getStaffProfile, login as loginRequest, logout as logoutRequest, type StaffUser } from "@/lib/adminApi";

interface AuthValue {
  user: StaffUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setUser(await getStaffProfile()); }
    catch { localStorage.removeItem("hasStaffSession"); setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const profile = localStorage.getItem("hasStaffSession")
      ? getStaffProfile()
      : Promise.resolve(null);
    profile
      .then((result) => { if (!cancelled) setUser(result); })
      .catch(() => { if (!cancelled) { localStorage.removeItem("hasStaffSession"); setUser(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const failed = () => setUser(null);
    window.addEventListener("staff-auth-failure", failed);
    return () => window.removeEventListener("staff-auth-failure", failed);
  }, []);

  async function login(identifier: string, password: string) {
    await loginRequest(identifier, password);
    localStorage.setItem("hasStaffSession", "1");
    setLoading(true);
    await load();
  }

  async function logout() {
    localStorage.removeItem("hasStaffSession");
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
