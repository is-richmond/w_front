import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Profile, ProfileUpdate } from '@/types/api';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiFetch<Profile>('/profile'),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdate) =>
      apiFetch<Profile>('/profile', { method: 'PUT', body: input }),
    onSuccess: (profile) => {
      qc.setQueryData(['profile'], profile);
      // The dashboard's calorie-goal reference line comes from the profile.
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
