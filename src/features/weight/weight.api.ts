import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { qk } from '@/lib/queryClient';
import type { WeightEntry } from '@/types/api';

export function useWeightHistory(range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  const qs = params.toString();
  return useQuery({
    queryKey: qk.weight(range),
    queryFn: () => apiFetch<WeightEntry[]>(`/weight${qs ? `?${qs}` : ''}`),
  });
}

interface LogWeightInput {
  weightKg: number;
  loggedFor?: string;
  note?: string;
}

export function useLogWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LogWeightInput) =>
      apiFetch<WeightEntry>('/weight', { method: 'POST', body: input }),
    // Logging weight should instantly refresh the dashboard + history.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['weight'] });
    },
  });
}
