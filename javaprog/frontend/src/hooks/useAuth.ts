"use client";

import { useEffect, useState } from "react";
import * as auth from "@/lib/auth";

export type AuthUser = { email: string; name: string; id: string };

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.getSessionUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    return auth.backendLogin(email, password);
  };

  const logout = () => {
    auth.backendLogout();
    setUser(null);
  };

  return { user, login, logout, isLoading };
}