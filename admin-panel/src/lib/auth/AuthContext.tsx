"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest } from "../apiClient";

export interface User {
  id: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState & { login: (email: string, password: string) => Promise<void>; logout: () => void; setToken: (t: string | null) => void } | null>(null);

const TOKEN_KEY = "admin_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    if (typeof window === "undefined") return;
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    setTokenState(t);
  }, []);

  const loadUser = useCallback(async (t: string) => {
    try {
      const res = await apiRequest<User>("auth/me", { token: t });
      setUser(res.data);
    } catch {
      setToken(null);
      setUser(null);
    }
  }, [setToken]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(TOKEN_KEY);
    setTokenState(stored);
    if (stored) {
      loadUser(stored).finally(() => setIsLoading(false));
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest<{ accessToken: string; refreshToken?: string; user?: User }>("auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const accessToken = (res.data as { accessToken: string }).accessToken;
    setToken(accessToken);
    if ((res.data as { user?: User }).user) {
      setUser((res.data as { user: User }).user);
    } else {
      await loadUser(accessToken);
    }
  }, [setToken, loadUser]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useToken(): string | null {
  return useAuth().token;
}
