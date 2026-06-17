import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { tokenStore } from '@/lib/api';
import type { AuthUser, SessionResponse } from '@/types/api';
import { authApi } from './auth.api';

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  /** Stores the email between OTP request and PIN steps. */
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  setSession: (session: SessionResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // On boot, try to resurrect a session from the refresh cookie.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await hydrateFromRefreshCookie();
        if (!active) return;
        setUser(session.user);
        setStatus('authenticated');
      } catch {
        if (active) setStatus('unauthenticated');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setSession = (session: SessionResponse) => {
    tokenStore.set(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
    setPendingEmail(null);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStore.set(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  const value = useMemo<AuthState>(
    () => ({ user, status, pendingEmail, setPendingEmail, setSession, logout }),
    [user, status, pendingEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// /auth/refresh returns { accessToken, user } when a valid cookie exists.
async function hydrateFromRefreshCookie(): Promise<SessionResponse> {
  const res = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('not authenticated');
  const data = (await res.json()) as SessionResponse;
  tokenStore.set(data.accessToken);
  return data;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
