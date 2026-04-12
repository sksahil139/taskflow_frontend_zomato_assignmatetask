import { useMemo, useState } from "react";
import type { User } from "./auth-types";
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
} from "./auth-storage";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  function login(nextToken: string, nextUser: User) {
    setStoredAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  };
}