import { useMemo, useState } from 'react';
import type { Meal } from '@/types/api';
import { useMeals, useRepeatMeal } from './meals.api';
import { AddMealSheet } from './AddMealSheet';

const today = () => new Date().toISOString().slice(0, 10);
const shiftDay = (iso: string, delta: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};

export function DiaryScreen() {
  const [date, setDate] = useState(today());
  const [adding, setAdding] = useState(false);
  const { data: meals, isLoading } = useMeals(date);
  const repeatMeal = useRepeatMeal();

  const dayTotal = useMemo(
    () => (meals ?? []).reduce((sum, m) => sum + m.totals.calories, 0),
    [meals],
  );

  return (
    <div className="space-y-4 px-4 pb-24 pt-4">
      {/* Date pager */}
      <header className="flex items-center justify-between">
        <button
          onClick={() => setDate((d) => shiftDay(d, -1))}
          className="rounded-full bg-slate-800 px-3 py-1 text-lg"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="font-semibold">{date === today() ? 'Today' : date}</div>
          <div className="text-xs text-slate-400">{Math.round(dayTotal)} kcal</div>
        </div>
        <button
          onClick={() => setDate((d) => (d < today() ? shiftDay(d, 1) : d))}
          disabled={date >= today()}
          className="rounded-full bg-slate-800 px-3 py-1 text-lg disabled:opacity-30"
        >
          ›
        </button>
      </header>

      {isLoading ? (
        <p className="py-12 text-center text-slate-400">Loading…</p>
      ) : meals && meals.length > 0 ? (
        <div className="space-y-3">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onRepeatToday={() =>
                repeatMeal.mutate({ mealId: meal.id, targetDate: today() })
              }
              repeating={repeatMeal.isPending}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-slate-500">
          No meals logged for this day.
        </p>
      )}

      <button
        onClick={() => setAdding(true)}
        className="fixed bottom-20 right-4 z-10 rounded-full bg-brand px-5 py-3 font-semibold text-slate-950 shadow-lg active:scale-95"
      >
        + Meal
      </button>

      {adding && <AddMealSheet date={date} onClose={() => setAdding(false)} />}
    </div>
  );
}

function MealCard({
  meal,
  onRepeatToday,
  repeating,
}: {
  meal: Meal;
  onRepeatToday: () => void;
  repeating: boolean;
}) {
  return (
    <article className="rounded-2xl bg-slate-900 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{meal.name}</h3>
          <span className="text-xs uppercase tracking-wide text-slate-500">
            {meal.mealType.toLowerCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="font-semibold text-brand">
            {Math.round(meal.totals.calories)} kcal
          </div>
          <button
            onClick={onRepeatToday}
            disabled={repeating}
            className="mt-1 text-xs text-slate-400 underline disabled:opacity-50"
          >
            Repeat today
          </button>
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-slate-300">
        {meal.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.name}{' '}
              <span className="text-slate-500">· {Math.round(item.grams)}g</span>
            </span>
            <span className="text-slate-400">{Math.round(item.calories)} kcal</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-4 border-t border-slate-800 pt-2 text-xs text-slate-400">
        <span>P {Math.round(meal.totals.proteins)}g</span>
        <span>F {Math.round(meal.totals.fats)}g</span>
        <span>C {Math.round(meal.totals.carbs)}g</span>
      </div>
    </article>
  );
}
