import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { UserPlus, Wallet, Package, CalendarClock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { LicitacaoStatusBadge } from '@/components/shared/StatusBadges';
import { getDashboard } from '@/services/dashboardService';
import * as licitacoesService from '@/services/licitacoesService';
import { formatMoeda, formatData } from '@/utils/format';
import { showApiError } from '@/utils/errors';

export function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const { data: licitacoes = [], isLoading: loadingLic } = useQuery({
    queryKey: ['licitacoes'],
    queryFn: licitacoesService.listar,
  });

  useEffect(() => {
    if (isError && error) showApiError(error);
  }, [isError, error]);

  if (isLoading) return <PageLoader />;
  if (isError) return <p className="text-sm text-destructive">Não foi possível carregar o painel.</p>;
  if (!data) return null;

  // Estatísticas de licitações
  const totalLicitacoes = licitacoes.length;
  const abertas = licitacoes.filter((l) => l.status === 'ABERTA').length;
  const emTransito = licitacoes.filter((l) => l.status === 'EM_TRANSITO').length;
  const valorTotal = licitacoes
    .filter((l) => l.status !== 'CANCELADA')
    .reduce((acc, l) => acc + l.valorTotal, 0);

  // Licitações recentes (últimas 5, excluindo canceladas e entregues)
  const licitacoesAtivas = licitacoes
    .filter((l) => l.status !== 'CANCELADA' && l.status !== 'ENTREGUE')
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Cards de cooperados e anuidades */}
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

      {/* Cards financeiros */}
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

      {/* Seção de licitações */}
      <div>
        <h2 className="mb-4 text-base font-semibold tracking-tight">Licitações</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de licitações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalLicitacoes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Abertas</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <p className="text-3xl font-bold">{abertas}</p>
              {abertas > 0 && <Badge variant="outline">Ativas</Badge>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em trânsito</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <p className="text-3xl font-bold">{emTransito}</p>
              {emTransito > 0 && <Badge variant="default">Em andamento</Badge>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor total (ativas)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-primary">{formatMoeda(valorTotal)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabela de licitações ativas */}
      {!loadingLic && licitacoesAtivas.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Licitações em andamento</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/licitacoes">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Edital</TableHead>
                  <TableHead>Órgão</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licitacoesAtivas.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.numeroEdital}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{l.orgaoLicitante}</TableCell>
                    <TableCell>{formatMoeda(l.valorTotal)}</TableCell>
                    <TableCell>{formatData(l.prazoEntrega)}</TableCell>
                    <TableCell>
                      <LicitacaoStatusBadge status={l.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Atalhos */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Atalhos</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/app/cooperados">
              <UserPlus className="h-4 w-4" />
              Cadastrar cooperado
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/app/lancamentos">
              <Wallet className="h-4 w-4" />
              Registrar lançamento
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/app/estoque">
              <Package className="h-4 w-4" />
              Registrar estoque
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/app/anuidades">
              <CalendarClock className="h-4 w-4" />
              Nova anuidade
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/app/licitacoes">
              <FileText className="h-4 w-4" />
              Nova licitação
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}