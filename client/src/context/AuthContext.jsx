import { createContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

const STORAGE_KEY = "learnflow-auth";

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const storedAuth = readStoredAuth();
  const [user, setUser] = useState(storedAuth?.user || null);
  const [token, setToken] = useState(storedAuth?.token || null);
  const [loading, setLoading] = useState(Boolean(storedAuth?.token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    authService
      .me()
      .then((currentUser) => {
        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            token,
            user: currentUser,
          })
        );
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const syncAuth = (authPayload) => {
    setToken(authPayload.token);
    setUser(authPayload.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authPayload));
  };

  const login = async (credentials) => {
    const authPayload = await authService.login(credentials);
    syncAuth(authPayload);
    return authPayload;
  };

  const register = async (payload) => {
    const authPayload = await authService.register(payload);
    syncAuth(authPayload);
    return authPayload;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const currentUser = await authService.me();
    setUser(currentUser);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token,
        user: currentUser,
      })
    );
    return currentUser;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
