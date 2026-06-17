import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { useRecommendation } from './recommendation.api';
import { GoalsSheet } from '@/features/profile/GoalsSheet';

/**
 * "Совет на завтра" — calls the AI on demand (button) so we don't spend a Groq
 * request on every dashboard view.
 */
export function RecommendationCard() {
  const rec = useRecommendation();
  const [showGoals, setShowGoals] = useState(false);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/40 p-4 ring-1 ring-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-300">✨ Совет на завтра</h2>
        <button
          onClick={() => setShowGoals(true)}
          className="text-xs text-slate-400 underline"
        >
          Моя цель
        </button>
      </div>

      {rec.data ? (
        <>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
            {rec.data.recommendation}
          </p>
          <div className="mt-3 flex gap-4 border-t border-slate-800 pt-2 text-xs text-slate-400">
            <span>{rec.data.totals.calories} ккал</span>
            <span>Б {rec.data.totals.proteins}г</span>
            <span>Ж {rec.data.totals.fats}г</span>
            <span>У {rec.data.totals.carbs}г</span>
          </div>
          <button
            onClick={() => rec.mutate(undefined)}
            disabled={rec.isPending}
            className="mt-3 text-xs text-brand underline disabled:opacity-50"
          >
            {rec.isPending ? 'Обновляем…' : 'Обновить'}
          </button>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-3 text-sm text-slate-400">
            Проанализирую, что ты съел сегодня, и подскажу, что добавить завтра.
          </p>
          <button
            onClick={() => rec.mutate(undefined)}
            disabled={rec.isPending}
            className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {rec.isPending ? 'Думаю…' : 'Получить совет'}
          </button>
          {rec.error && (
            <p className="mt-2 text-xs text-red-400">
              {rec.error instanceof ApiError ? rec.error.message : 'Не удалось'}
            </p>
          )}
        </div>
      )}

      {showGoals && <GoalsSheet onClose={() => setShowGoals(false)} />}
    </section>
  );
}
