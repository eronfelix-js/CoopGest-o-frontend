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

/**
 * Escuta o evento global 'session-expired' emitido pelo interceptor do Axios
 * e também verifica a expiração periodicamente enquanto o usuário está na tela.
 *
 * Coloque este componente dentro do RouterProvider, em AppLayout ou em App.tsx.
 */
export function SessionExpiredModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const isSessionValid = useAuthStore((s) => s.isSessionValid());
  const secondsUntilExpiry = useAuthStore((s) => s.secondsUntilExpiry());

  // Escuta o evento disparado pelo interceptor do Axios
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, []);

  // Verifica a cada 30 segundos se a sessão ainda é válida
  // (cobre o caso do usuário deixar a aba aberta sem fazer requisições)
  useEffect(() => {
    if (!isSessionValid && !open) {
      // Só abre o modal se havia uma sessão antes (evita abrir na tela de login)
      const hadToken = useAuthStore.getState().accessToken !== null;
      if (hadToken) setOpen(true);
    }
  }, [isSessionValid, open]);

  // Agendar abertura automática quando faltam 60s para expirar
  useEffect(() => {
    if (secondsUntilExpiry <= 0 || secondsUntilExpiry > 120) return;
    const timeout = setTimeout(() => {
      setOpen(true);
    }, (secondsUntilExpiry - 60) * 1000);
    return () => clearTimeout(timeout);
  }, [secondsUntilExpiry]);

  const handleLogin = () => {
    logout();
    setOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <AlertDialog open={open} onOpenChange={() => {}}>
      <AlertDialogContent
        // Impede fechar clicando fora — o usuário precisa fazer login
        onPointerDownOutside={(e: Event) => e.preventDefault()}
        onEscapeKeyDown={(e: Event) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <AlertDialogTitle className="text-center">Sessão expirada</AlertDialogTitle>
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