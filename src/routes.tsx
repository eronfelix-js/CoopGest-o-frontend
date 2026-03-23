import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PrivateRoute } from '@/components/shared/PrivateRoute';
import { GestorRoute } from '@/components/shared/GestorRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CooperadosPage } from '@/pages/cooperados/CooperadosPage';
import { CooperadoDetalhePage } from '@/pages/cooperados/CooperadoDetalhePage';
import { AnuidadesPage } from '@/pages/anuidades/AnuidadesPage';
import { EstoquePage } from '@/pages/estoque/EstoquePage';
import { LancamentosPage } from '@/pages/lancamentos/LancamentosPage';
import { RelatoriosPage } from '@/pages/relatorios/RelatoriosPage';
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage';

function AppRedirect() {
  const isGestor = useAuthStore((s) => s.isGestor());
  return <Navigate to={isGestor ? '/dashboard' : '/cooperados'} replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <AppRedirect />, handle: { title: 'Início' } },
      {
        path: 'dashboard',
        element: (
          <GestorRoute>
            <DashboardPage />
          </GestorRoute>
        ),
        handle: { title: 'Dashboard' },
      },
      { path: 'cooperados', element: <CooperadosPage />, handle: { title: 'Cooperados' } },
      { path: 'cooperados/:id', element: <CooperadoDetalhePage />, handle: { title: 'Cooperado' } },
      {
        path: 'anuidades',
        element: (
          <GestorRoute>
            <AnuidadesPage />
          </GestorRoute>
        ),
        handle: { title: 'Anuidades' },
      },
      {
        path: 'estoque',
        element: (
          <GestorRoute>
            <EstoquePage />
          </GestorRoute>
        ),
        handle: { title: 'Estoque' },
      },
      {
        path: 'lancamentos',
        element: (
          <GestorRoute>
            <LancamentosPage />
          </GestorRoute>
        ),
        handle: { title: 'Caixa' },
      },
      {
        path: 'relatorios',
        element: (
          <GestorRoute>
            <RelatoriosPage />
          </GestorRoute>
        ),
        handle: { title: 'Relatórios' },
      },
      {
        path: 'usuarios',
        element: (
          <GestorRoute>
            <UsuariosPage />
          </GestorRoute>
        ),
        handle: { title: 'Usuários' },
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
