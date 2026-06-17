import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { RecommendationResponse } from '@/types/api';

/**
 * The recommendation calls Llama, so it's a manual (mutation) trigger rather
 * than an auto-fetching query — this keeps the daily Groq request budget low.
 */
export function useRecommendation() {
  return useMutation({
    mutationFn: (date?: string) =>
      apiFetch<RecommendationResponse>(
        `/analytics/recommendation${date ? `?date=${date}` : ''}`,
      ),
  });
}
