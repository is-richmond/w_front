import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { qk } from '@/lib/queryClient';
import type { DashboardResponse } from '@/types/api';

export function useDashboard(days = 30) {
  return useQuery({
    queryKey: qk.dashboard(days),
    queryFn: () => apiFetch<DashboardResponse>(`/analytics/dashboard?days=${days}`),
  });
}
