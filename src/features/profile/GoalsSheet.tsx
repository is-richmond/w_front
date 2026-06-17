import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { useProfile, useUpdateProfile } from './profile.api';

const GOAL_PRESETS = ['набрать мышечную массу', 'похудеть', 'поддержание формы'];

/** Bottom-sheet to set the calorie/macro goals that feed the AI recommendation. */
export function GoalsSheet({ onClose }: { onClose: () => void }) {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);

  const [goalType, setGoalType] = useState(profile?.goalType ?? GOAL_PRESETS[0]);
  const [kcal, setKcal] = useState(profile?.dailyCalorieGoal?.toString() ?? '');
  const [p, setP] = useState(profile?.proteinTargetG?.toString() ?? '');
  const [f, setF] = useState(profile?.fatTargetG?.toString() ?? '');
  const [c, setC] = useState(profile?.carbTargetG?.toString() ?? '');

  const numOrNull = (v: string) => (v.trim() ? Number(v) : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        goalType,
        dailyCalorieGoal: numOrNull(kcal),
        proteinTargetG: numOrNull(p),
        fatTargetG: numOrNull(f),
        carbTargetG: numOrNull(c),
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить');
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        data-scroll
        className="max-h-[88vh] w-full space-y-4 overflow-y-auto rounded-t-3xl bg-slate-900 p-6 pb-8"
      >
        <h2 className="text-lg font-semibold">Моя цель</h2>

        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoalType(g)}
              className={`rounded-full px-3 py-1 text-sm ${
                goalType === g ? 'bg-brand text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <Field label="Норма калорий, ккал" value={kcal} onChange={setKcal} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Белки, г" value={p} onChange={setP} />
          <Field label="Жиры, г" value={f} onChange={setF} />
          <Field label="Углеводы, г" value={c} onChange={setC} />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-slate-800 py-3 font-medium"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={update.isPending}
            className="flex-1 rounded-2xl bg-brand py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {update.isPending ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-brand"
      />
    </label>
  );
}
