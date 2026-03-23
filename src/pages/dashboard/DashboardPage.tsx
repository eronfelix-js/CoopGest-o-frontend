import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { UserPlus, Wallet, Package, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { getDashboard } from '@/services/dashboardService';
import { formatMoeda } from '@/utils/format';
import { showApiError } from '@/utils/errors';

export function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  useEffect(() => {
    if (isError && error) showApiError(error);
  }, [isError, error]);

  if (isLoading) return <PageLoader />;
  if (isError) return <p className="text-sm text-destructive">Não foi possível carregar o painel.</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de cooperados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalCooperados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cooperados ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.cooperadosAtivos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Anuidades atrasadas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <p className="text-3xl font-bold">{data.anuidadesAtrasadas}</p>
            {data.anuidadesAtrasadas > 0 && <Badge variant="destructive">Atenção</Badge>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Anuidades pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.anuidesPendentes}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saldo do caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">{formatMoeda(Number(data.saldoCaixa))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entradas (mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-600">{formatMoeda(Number(data.totalEntradas))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saídas (mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">{formatMoeda(Number(data.totalSaidas))}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Atalhos</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/cooperados">
              <UserPlus className="h-4 w-4" />
              Cadastrar cooperado
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/lancamentos">
              <Wallet className="h-4 w-4" />
              Registrar lançamento
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/estoque">
              <Package className="h-4 w-4" />
              Registrar estoque
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/anuidades">
              <CalendarClock className="h-4 w-4" />
              Nova anuidade
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
