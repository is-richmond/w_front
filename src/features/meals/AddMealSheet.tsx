import { useState } from 'react';
import { ApiError } from '@/lib/api';
import type { FoodInput, MealType } from '@/types/api';
import { useCreateMeal } from './meals.api';

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER'];

const emptyItem = (): FoodInput => ({ name: '', grams: undefined });

/**
 * Log a meal by typing only the food name + (optional) weight. On save the
 * backend asks Llama to compute KБЖУ; a blank weight means "standard portion".
 */
export function AddMealSheet({ date, onClose }: { date: string; onClose: () => void }) {
  const createMeal = useCreateMeal();
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('BREAKFAST');
  const [items, setItems] = useState<FoodInput[]>([emptyItem()]);
  const [error, setError] = useState<string | null>(null);

  const updateItem = (i: number, patch: Partial<FoodInput>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = items
      .filter((it) => it.name.trim())
      .map((it) => ({
        name: it.name.trim(),
        ...(it.grams && it.grams > 0 ? { grams: it.grams } : {}),
      }));
    if (!name.trim() || cleaned.length === 0) {
      setError('Добавьте название блюда и хотя бы один продукт');
      return;
    }
    try {
      await createMeal.mutateAsync({
        name: name.trim(),
        mealType,
        loggedFor: date,
        items: cleaned,
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить блюдо');
    }
  };

  const busy = createMeal.isPending;

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        data-scroll
        className="max-h-[88vh] w-full space-y-4 overflow-y-auto rounded-t-3xl bg-slate-900 p-6 pb-8"
      >
        <h2 className="text-lg font-semibold">Добавить блюдо</h2>

        <input
          placeholder="Название блюда (напр. Завтрак)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-brand disabled:opacity-60"
        />

        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMealType(t)}
              disabled={busy}
              className={`rounded-full px-3 py-1 text-sm ${
                mealType === t ? 'bg-brand text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {t.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="Продукт, напр. Творог 9%"
                value={item.name}
                onChange={(e) => updateItem(i, { name: e.target.value })}
                disabled={busy}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
              <div className="relative w-24">
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  placeholder="вес"
                  value={item.grams ?? ''}
                  onChange={(e) =>
                    updateItem(i, {
                      grams: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 pr-7 text-sm outline-none focus:border-brand"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  г
                </span>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                  disabled={busy}
                  className="px-1 text-slate-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems((p) => [...p, emptyItem()])}
            disabled={busy}
            className="w-full rounded-2xl border border-dashed border-slate-700 py-2 text-sm text-slate-400"
          >
            + Ещё продукт
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Вес можно не указывать — возьмём стандартную порцию. КБЖУ рассчитает ИИ.
        </p>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-2xl bg-slate-800 py-3 font-medium"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-2xl bg-brand py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {busy ? 'Считаем КБЖУ…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}
