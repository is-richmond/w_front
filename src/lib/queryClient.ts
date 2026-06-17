import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** Centralised query keys so invalidation stays consistent across features. */
export const qk = {
  dashboard: (days: number) => ['dashboard', days] as const,
  weight: (range?: { from?: string; to?: string }) => ['weight', range ?? {}] as const,
  meals: (date: string) => ['meals', date] as const,
} as const;
