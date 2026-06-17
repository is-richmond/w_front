import { apiFetch } from '@/lib/api';
import type { InitiationResponse, SessionResponse } from '@/types/api';

export const authApi = {
  requestOtp: (email: string) =>
    apiFetch<{ message: string }>('/auth/request-otp', {
      method: 'POST',
      body: { email },
    }),

  verifyOtp: (email: string, code: string) =>
    apiFetch<InitiationResponse>('/auth/verify-otp', {
      method: 'POST',
      body: { email, code },
    }),

  setPin: (initiationToken: string, pin: string) =>
    apiFetch<SessionResponse>('/auth/set-pin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${initiationToken}` },
      body: { pin },
    }),

  verifyPin: (email: string, pin: string) =>
    apiFetch<SessionResponse>('/auth/verify-pin', {
      method: 'POST',
      body: { email, pin },
    }),

  logout: () => apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),
};
