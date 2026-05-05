"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { apiClient } from "@/ui/api/client";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: "user" | "guest";
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthResponse = {
  user?: AuthUser;
  id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "user" | "guest";
};

function normalizeAuthUser(data: AuthResponse): AuthUser {
  if (data.user) {
    return data.user;
  }

  return {
    id: data.id ?? "",
    name: data.name ?? "",
    email: data.email ?? "",
    role: data.role ?? "guest",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchMe = async () => {
    try {
      const data = await apiClient.get<AuthResponse>("/api/auth/me");
      const nextUser = normalizeAuthUser(data);

      if (!nextUser.id) {
        setUser(null);
        return null;
      }

      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetchMe();
  }, []);

  const login: AuthContextValue["login"] = async (payload) => {
    const data = await apiClient.post<AuthResponse, LoginPayload>("/api/auth/login", payload);
    const nextUser = normalizeAuthUser(data);
    setUser(nextUser);
    return nextUser;
  };

  const register: AuthContextValue["register"] = async (payload) => {
    const data = await apiClient.post<AuthResponse, RegisterPayload>(
      "/api/auth/register",
      payload,
    );
    const nextUser = normalizeAuthUser(data);
    setUser(nextUser);
    return nextUser;
  };

  const logout: AuthContextValue["logout"] = async () => {
    await apiClient.post<null, Record<string, never>>("/api/auth/logout", {});
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refetchMe,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
