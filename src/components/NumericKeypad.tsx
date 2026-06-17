import { useEffect } from 'react';

interface NumericKeypadProps {
  /** Current entered digits. */
  value: string;
  onChange: (next: string) => void;
  /** Total number of dots / slots (4 for PIN, 6 for OTP). */
  length: number;
  /** Optional error to shake + show under the dots. */
  error?: string | null;
  busy?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/**
 * Mobile-first numeric keypad with masked dots. Also accepts physical
 * keyboard input for desktop testing. Auto-submits via the parent when
 * `value` reaches `length`.
 */
export function NumericKeypad({
  value,
  onChange,
  length,
  error,
  busy = false,
}: NumericKeypadProps) {
  const press = (key: string) => {
    if (busy) return;
    if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else if (key && value.length < length) {
      onChange(value + key);
    }
  };

  // Physical keyboard support.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') press(e.key);
      else if (e.key === 'Backspace') press('⌫');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div className="flex flex-col items-center gap-8">
      <div className={`flex gap-3 ${error ? 'animate-[shake_0.3s]' : ''}`}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border transition-colors ${
              i < value.length
                ? 'border-brand bg-brand'
                : 'border-slate-600 bg-transparent'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {KEYS.map((key, i) =>
          key === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => press(key)}
              disabled={busy}
              className="flex h-16 items-center justify-center rounded-2xl bg-slate-800 text-2xl font-medium text-slate-100 transition-transform active:scale-95 active:bg-slate-700 disabled:opacity-50"
            >
              {key}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
