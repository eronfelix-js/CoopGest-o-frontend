import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function GestorRoute({ children }: { children: React.ReactNode }) {
  const isGestor = useAuthStore((s) => s.isGestor());
  if (!isGestor) {
    return <Navigate to="/cooperados" replace />;
  }
  return <>{children}</>;
}
