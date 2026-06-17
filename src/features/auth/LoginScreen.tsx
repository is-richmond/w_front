import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/lib/api';
import { useAuth } from './AuthContext';
import { authApi } from './auth.api';
import { NumericKeypad } from '@/components/NumericKeypad';

type Step = 'email' | 'otp';

/** Login screen: collect email → dispatch OTP → verify 6-digit code. */
export function LoginScreen() {
  const navigate = useNavigate();
  const { setPendingEmail } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authApi.requestOtp(email.trim());
      setPendingEmail(email.trim());
      setStep('otp');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (value: string) => {
    setCode(value);
    if (value.length !== 6) return;
    setError(null);
    setBusy(true);
    try {
      const res = await authApi.verifyOtp(email.trim(), value);
      // Hand the initiation token + intent to the PIN screen.
      navigate('/pin', {
        state: {
          mode: res.pinAlreadySet ? 'verify' : 'set',
          initiationToken: res.initiationToken,
        },
      });
    } catch (err) {
      setCode('');
      setError(err instanceof ApiError ? err.message : 'Invalid code');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight">WeightCalc</h1>
        <p className="mb-10 text-center text-slate-400">
          {step === 'email'
            ? 'Enter your email to sign in'
            : `Enter the 6-digit code sent to ${email}`}
        </p>

        {step === 'email' ? (
          <form onSubmit={submitEmail} className="space-y-4">
            <input
              type="email"
              required
              autoFocus
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-lg outline-none focus:border-brand"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy || !email}
              className="w-full rounded-2xl bg-brand py-4 text-lg font-semibold text-slate-950 transition active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Send code'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <NumericKeypad
              value={code}
              onChange={submitOtp}
              length={6}
              error={error}
              busy={busy}
            />
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              className="w-full text-center text-sm text-slate-400 underline"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
