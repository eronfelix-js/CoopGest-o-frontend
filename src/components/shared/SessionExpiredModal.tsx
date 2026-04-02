import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store/authStore';

export function SessionExpiredModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isSessionValid = useAuthStore((s) => s.isSessionValid);
  const secondsUntilExpiry = useAuthStore((s) => s.secondsUntilExpiry);

  // 🔥 Evento global (Axios interceptor)
  useEffect(() => {
    const handler = () => setOpen(true);

    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, []);

  // 🔥 Verificação periódica (mais confiável)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSessionValid() && accessToken) {
        setOpen(true);
      }
    }, 30000); // 30s

    return () => clearInterval(interval);
  }, [isSessionValid, accessToken]);

  // 🔥 Aviso antes de expirar (60s antes)
  useEffect(() => {
    const seconds = secondsUntilExpiry();

    if (seconds <= 60 && seconds > 0) {
      setOpen(true);
    }
  }, [secondsUntilExpiry]);

  const handleLogin = () => {
    logout();
    setOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>

          <AlertDialogTitle className="text-center">
            Sessão expirada
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            Sua sessão expirou por inatividade. Faça login novamente para continuar.
            <br />
            <span className="mt-1 block text-xs text-muted-foreground">
              Seus dados não foram perdidos.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="justify-center">
          <Button onClick={handleLogin} className="w-full sm:w-auto">
            <LogIn className="h-4 w-4" />
            Fazer login novamente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}