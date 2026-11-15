import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/mockApi';

const AuthContext = createContext(null);
const SESSION_KEY = 'gb_session';

function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

/**
 * Holds the logged-in user plus student data (profile, saved programs)
 * that several pages share.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState([]);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    try {
      if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [user]);

  // Load student data whenever a student logs in.
  useEffect(() => {
    if (user?.role !== 'student') {
      setProfile(null);
      setSaved([]);
      setProfileReady(false);
      return;
    }
    let active = true;
    setProfileReady(false);
    Promise.all([api.getProfile(user.id), api.getSaved(user.id)])
      .then(([p, s]) => {
        if (active) {
          setProfile(p);
          setSaved(s);
        }
      })
      .catch(() => {
        /* pages show their own error states */
      })
      .finally(() => active && setProfileReady(true));
    return () => {
      active = false;
    };
  }, [user]);

  const login = useCallback(async (credentials) => {
    const u = await api.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await api.register(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const saveProfile = useCallback(
    async (p) => {
      const result = await api.updateProfile(user.id, p);
      setProfile(result);
      return result;
    },
    [user],
  );

  const toggleSaved = useCallback(
    async (programId) => {
      const next = await api.toggleSaved(user.id, programId);
      setSaved(next);
      return next;
    },
    [user],
  );

  const isSaved = useCallback((programId) => saved.some((s) => s.programId === programId), [saved]);

  const value = useMemo(
    () => ({ user, profile, profileReady, saved, login, register, logout, saveProfile, toggleSaved, isSaved }),
    [user, profile, profileReady, saved, login, register, logout, saveProfile, toggleSaved, isSaved],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
