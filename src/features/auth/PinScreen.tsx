import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '@/lib/api';
import { useAuth } from './AuthContext';
import { authApi } from './auth.api';
import { NumericKeypad } from '@/components/NumericKeypad';

interface PinNavState {
  mode: 'set' | 'verify';
  initiationToken?: string;
}

/**
 * PIN screen, two modes:
 *  - `set`    : first-time onboarding after OTP — uses the initiation token.
 *  - `verify` : returning login — needs the stored pendingEmail + PIN.
 */
export function PinScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingEmail, setSession } = useAuth();
  const state = (location.state as PinNavState | null) ?? { mode: 'verify' };

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [phase, setPhase] = useState<'enter' | 'confirm'>('enter');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If we landed here without the context we need, bounce to login.
  useEffect(() => {
    if (state.mode === 'set' && !state.initiationToken) navigate('/login', { replace: true });
    if (state.mode === 'verify' && !pendingEmail && !state.initiationToken) {
      navigate('/login', { replace: true });
    }
  }, [state, pendingEmail, navigate]);

  const onEnterComplete = async (value: string) => {
    setPin(value);
    if (value.length !== 4) return;

    if (state.mode === 'set') {
      // Move to the confirmation phase before persisting.
      setPhase('confirm');
      setError(null);
      return;
    }
    await verify(value);
  };

  const onConfirmComplete = async (value: string) => {
    setConfirmPin(value);
    if (value.length !== 4) return;
    if (value !== pin) {
      setError("PINs don't match, try again");
      setPin('');
      setConfirmPin('');
      setPhase('enter');
      return;
    }
    await setPinFlow(value);
  };

  const setPinFlow = async (value: string) => {
    if (!state.initiationToken) return;
    setBusy(true);
    setError(null);
    try {
      const session = await authApi.setPin(state.initiationToken, value);
      setSession(session);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not set PIN');
      setPin('');
      setConfirmPin('');
      setPhase('enter');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    if (!pendingEmail) return;
    setBusy(true);
    setError(null);
    try {
      const session = await authApi.verifyPin(pendingEmail, value);
      setSession(session);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Incorrect PIN');
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  const title =
    state.mode === 'set'
      ? phase === 'enter'
        ? 'Create a 4-digit PIN'
        : 'Confirm your PIN'
      : 'Enter your PIN';

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-10 text-center text-2xl font-semibold">{title}</h1>
        {phase === 'enter' ? (
          <NumericKeypad
            value={pin}
            onChange={onEnterComplete}
            length={4}
            error={error}
            busy={busy}
          />
        ) : (
          <NumericKeypad
            value={confirmPin}
            onChange={onConfirmComplete}
            length={4}
            error={error}
            busy={busy}
          />
        )}
      </div>
    </div>
  );
}
