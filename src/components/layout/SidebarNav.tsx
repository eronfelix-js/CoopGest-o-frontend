import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Package,
  Wallet,
  FileBarChart,
  UserCog,
  Sprout,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Separator } from '@/components/ui/separator';

const gestorLinks = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/cooperados', label: 'Cooperados', icon: Users },
  { to: '/app/licitacoes', label: 'Licitações', icon: FileText },
  { to: '/app/anuidades', label: 'Anuidades', icon: CalendarClock },
  { to: '/app/estoque', label: 'Estoque', icon: Package },
  { to: '/app/lancamentos', label: 'Caixa', icon: Wallet },
  { to: '/app/relatorios', label: 'Relatórios', icon: FileBarChart },
  { to: '/app/usuarios', label: 'Usuários', icon: UserCog },
];

const colaboradorLinks = [{ to: '/app/cooperados', label: 'Cooperados', icon: Users }];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const isGestor = useAuthStore((s) => s.isGestor());
  const links = isGestor ? gestorLinks : colaboradorLinks;

  return (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      <div className="mb-4 flex items-center gap-2 px-2">
        <Sprout className="h-8 w-8 text-primary" />
        <div>
          <p className="text-lg font-bold leading-tight text-primary">CoopGestão</p>
          <p className="text-xs text-muted-foreground">Painel web</p>
        </div>
      </div>
      <Separator className="mb-2" />
      {links.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to || (to !== '/app/dashboard' && location.pathname.startsWith(to + '/'));
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
