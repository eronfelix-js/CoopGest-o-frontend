import { useState } from 'react';
import { Outlet, useMatches, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { useAuthStore } from '@/store/authStore';

function initials(name: string | null, email: string | null) {
  const s = name || email || '?';
  const parts = s.split(/[\s@]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

type Handle = { title?: string };

export function AppLayout() {
  const matches = useMatches();
  const title =
    (matches[matches.length - 1]?.handle as Handle | undefined)?.title ?? 'CoopGestão';
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const userName = useAuthStore((s) => s.userName);
  const userEmail = useAuthStore((s) => s.userEmail);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="relative hidden min-h-screen w-64 shrink-0 flex-col border-r bg-card md:flex">
        <SidebarNav />
        <div className="mt-auto border-t p-4">
          <div className="mb-3 flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials(userName, userEmail)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName || userEmail || 'Usuário'}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <SidebarNav onNavigate={() => setOpen(false)} />
              <div className="mt-auto border-t p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials(userName, userEmail)}</AvatarFallback>
                  </Avatar>
                  <p className="truncate text-sm font-medium">{userName || userEmail}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setOpen(false); handleLogout(); }}>
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>

        <header className="hidden h-14 items-center justify-between border-b px-8 md:flex">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userName || userEmail}</span>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
