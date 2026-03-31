import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isSessionValid = useAuthStore((s) => s.isSessionValid());
  const location = useLocation();

  // isSessionValid já checa token != null E expiresAt > now()
  if (!isSessionValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}