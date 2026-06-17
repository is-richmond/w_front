// Mirrors backend/src/types/entities.ts — the JSON contract.

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface SessionResponse {
  accessToken: string;
  user: AuthUser;
}

export interface InitiationResponse {
  initiationToken: string;
  pinAlreadySet: boolean;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  loggedFor: string;
  note: string | null;
  createdAt: string;
}

export interface MealItem {
  id: string;
  name: string;
  grams: number;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export type MealItemInput = Omit<MealItem, 'id'>;

export interface MacroTotals {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface Meal {
  id: string;
  name: string;
  mealType: MealType;
  loggedFor: string;
  createdAt: string;
  items: MealItem[];
  totals: MacroTotals;
}

export interface DashboardDailyPoint {
  date: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  weightKg: number | null;
}

export interface DashboardResponse {
  rangeDays: number;
  dailyCalorieGoal: number | null;
  series: DashboardDailyPoint[];
  summary: {
    avgCalories: number;
    latestWeightKg: number | null;
    weightChangeKg: number | null;
    daysLogged: number;
  };
}
