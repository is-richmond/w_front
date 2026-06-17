import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { qk } from '@/lib/queryClient';
import type { FoodInput, Meal, MealType } from '@/types/api';

export function useMeals(date: string) {
  return useQuery({
    queryKey: qk.meals(date),
    queryFn: () => apiFetch<Meal[]>(`/meals?date=${date}`),
  });
}

export interface CreateMealInput {
  name: string;
  mealType?: MealType;
  loggedFor?: string;
  items: FoodInput[];
}

export function useCreateMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMealInput) =>
      apiFetch<Meal>('/meals', { method: 'POST', body: input }),
    onSuccess: (meal) => {
      qc.invalidateQueries({ queryKey: qk.meals(meal.loggedFor) });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRepeatMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { mealId: string; targetDate: string }) =>
      apiFetch<Meal>('/meals/repeat', { method: 'POST', body: input }),
    // Repeating a meal must instantly refresh the target day + dashboard.
    onSuccess: (meal) => {
      qc.invalidateQueries({ queryKey: qk.meals(meal.loggedFor) });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
