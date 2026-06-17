import { useState } from 'react';
import { ApiError } from '@/lib/api';
import type { MealItemInput, MealType } from '@/types/api';
import { useCreateMeal } from './meals.api';

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER'];

const emptyItem = (): MealItemInput => ({
  name: '',
  grams: 0,
  calories: 0,
  proteins: 0,
  fats: 0,
  carbs: 0,
});

export function AddMealSheet({ date, onClose }: { date: string; onClose: () => void }) {
  const createMeal = useCreateMeal();
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('BREAKFAST');
  const [items, setItems] = useState<MealItemInput[]>([emptyItem()]);
  const [error, setError] = useState<string | null>(null);

  const updateItem = (i: number, patch: Partial<MealItemInput>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = items.filter((it) => it.name.trim());
    if (!name.trim() || cleaned.length === 0) {
      setError('Add a meal name and at least one item');
      return;
    }
    try {
      await createMeal.mutateAsync({ name: name.trim(), mealType, loggedFor: date, items: cleaned });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save meal');
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="max-h-[88vh] w-full space-y-4 overflow-y-auto rounded-t-3xl bg-slate-900 p-6 pb-8"
      >
        <h2 className="text-lg font-semibold">Add meal</h2>

        <input
          placeholder="Meal name (e.g. Oatmeal bowl)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-brand"
        />

        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMealType(t)}
              className={`rounded-full px-3 py-1 text-sm ${
                mealType === t ? 'bg-brand text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {t.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-slate-950 p-3">
              <div className="flex items-center gap-2">
                <input
                  placeholder="Food item"
                  value={item.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-brand"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                    className="px-2 text-slate-500"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-5 gap-2">
                <NumField label="g" value={item.grams} onChange={(v) => updateItem(i, { grams: v })} />
                <NumField label="kcal" value={item.calories} onChange={(v) => updateItem(i, { calories: v })} />
                <NumField label="P" value={item.proteins} onChange={(v) => updateItem(i, { proteins: v })} />
                <NumField label="F" value={item.fats} onChange={(v) => updateItem(i, { fats: v })} />
                <NumField label="C" value={item.carbs} onChange={(v) => updateItem(i, { carbs: v })} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems((p) => [...p, emptyItem()])}
            className="w-full rounded-2xl border border-dashed border-slate-700 py-2 text-sm text-slate-400"
          >
            + Add item
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-slate-800 py-3 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMeal.isPending}
            className="flex-1 rounded-2xl bg-brand py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            {createMeal.isPending ? 'Saving…' : 'Save meal'}
          </button>
        </div>
      </form>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col text-center">
      <input
        type="number"
        min={0}
        inputMode="decimal"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-1 py-2 text-center text-sm outline-none focus:border-brand"
      />
      <span className="mt-1 text-[10px] uppercase text-slate-500">{label}</span>
    </label>
  );
}
