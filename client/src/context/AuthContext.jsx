// AuthContext — current user, login/logout, session bootstrap from localStorage.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import config from "../config.js";
import * as AuthAPI from "../api/auth.js";
import { getAccessToken, clearTokens } from "../api/client.js";

const AuthCtx = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(config.userKey);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeStoredUser(user) {
  if (user) localStorage.setItem(config.userKey, JSON.stringify(user));
  else localStorage.removeItem(config.userKey);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [bootLoading, setBootLoading] = useState(Boolean(getAccessToken()));

  // On mount: if we have a token, verify it with /auth/me. If it fails, clear.
  useEffect(() => {
    let alive = true;
    if (!getAccessToken()) { setBootLoading(false); return; }
    (async () => {
      try {
        const principal = await AuthAPI.me();
        if (!alive) return;
        // Merge principal roles into the cached user, in case roles changed.
        setUser((prev) => {
          const next = { ...(prev || {}), _id: prev?._id || principal.userId, roles: principal.roles };
          writeStoredUser(next);
          return next;
        });
      } catch {
        if (!alive) return;
        clearTokens();
        writeStoredUser(null);
        setUser(null);
      } finally {
        if (alive) setBootLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await AuthAPI.login(credentials);
    writeStoredUser(u);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const u = await AuthAPI.register(payload);
    writeStoredUser(u);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    AuthAPI.logout();
    writeStoredUser(null);
    setUser(null);
  }, []);

  const roles = user?.roles || [];
  const isAdmin = roles.includes("ADMIN");
  const isOrganizer = roles.includes("ORGANIZER");
  const isStudent = roles.includes("STUDENT") || (!isAdmin && !isOrganizer);

  // Effective role for routing/nav — admins > organizers > students.
  const effectiveRole = isAdmin ? "ADMIN" : isOrganizer ? "ORGANIZER" : "STUDENT";

  const value = useMemo(
    () => ({ user, roles, isAdmin, isOrganizer, isStudent, effectiveRole, login, register, logout, bootLoading }),
    [user, roles, isAdmin, isOrganizer, isStudent, effectiveRole, login, register, logout, bootLoading]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
