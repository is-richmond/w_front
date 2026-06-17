import type { SessionResponse } from '@/types/api';

/**
 * In-memory access token. We deliberately keep it out of localStorage to
 * limit XSS blast radius — the long-lived refresh token lives in an
 * HttpOnly cookie and is used to silently re-mint this on 401 / reload.
 */
let accessToken: string | null = null;
const subscribers = new Set<(token: string | null) => void>();

export const tokenStore = {
  get: () => accessToken,
  set(token: string | null) {
    accessToken = token;
    subscribers.forEach((fn) => fn(token));
  },
  subscribe(fn: (token: string | null) => void) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Internal: prevents infinite refresh recursion. */
  _retry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

/** Attempt to mint a new access token from the refresh cookie. Deduped. */
async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = (await res.json()) as SessionResponse;
        tokenStore.set(data.accessToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, _retry, ...rest } = options;

  const res = await fetch(`/api/v1${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Transparently refresh once on an expired access token.
  if (res.status === 401 && !_retry && path !== '/auth/refresh') {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retry: true });
    }
    tokenStore.set(null);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export { refreshSession };
