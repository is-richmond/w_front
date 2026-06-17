import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { useLogWeight } from './weight.api';

const today = () => new Date().toISOString().slice(0, 10);

/** Bottom-sheet form to log/overwrite today's weight. */
export function LogWeightSheet({ onClose }: { onClose: () => void }) {
  const logWeight = useLogWeight();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(today());
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(weight);
    if (!value || value <= 0) {
      setError('Enter a valid weight');
      return;
    }
    try {
      await logWeight.mutateAsync({ weightKg: value, loggedFor: date });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save');
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full space-y-4 rounded-t-3xl bg-slate-900 p-6 pb-8"
      >
        <h2 className="text-lg font-semibold">Log weight</h2>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            autoFocus
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Date</label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-brand"
          />
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
            disabled={logWeight.isPending}
            className="flex-1 rounded-2xl bg-brand py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            {logWeight.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
