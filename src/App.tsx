import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { PinScreen } from '@/features/auth/PinScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { DiaryScreen } from '@/features/meals/DiaryScreen';
import { BottomNav } from '@/components/BottomNav';

/** Wraps authenticated screens with the bottom nav; redirects if logged out. */
function ProtectedLayout() {
  const { status } = useAuth();
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto min-h-screen max-w-md">
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

/** Keeps logged-in users out of the auth screens. */
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginScreen />
          </PublicOnly>
        }
      />
      <Route path="/pin" element={<PinScreen />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardScreen />} />
        <Route path="/diary" element={<DiaryScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
