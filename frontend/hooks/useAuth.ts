"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearToken, isAuthenticated as checkAuth, setToken, setRole } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkAuth);

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      const { data } = await api.post<{ access_token: string; role: string }>(
        "/api/auth/login",
        { username, password },
      );
      setToken(data.access_token);
      if (data.role) setRole(data.role);
      setIsAuthenticated(true);
      window.location.href = "/dashboard.html";
    },
    [router],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // logout best-effort — always clear locally
    }
    clearToken();
    setIsAuthenticated(false);
    window.location.href = "/login.html";
  }, [router]);

  return { isAuthenticated, login, logout };
}
