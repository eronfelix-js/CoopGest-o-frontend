import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Download, CreditCard, ChevronDown, ChevronUp, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { CooperadoPicker } from '@/components/shared/CooperadoPicker';
import * as cotaParteService from '@/services/cotaParteService';
import { downloadComprovanteCotaParte, downloadRelatorioCotas } from '@/utils/Pdfcotaparte';
import { formatData, formatMoeda } from '@/utils/format';
import { showApiError, getFieldErrors } from '@/utils/errors';
import type { CotaParte, StatusCota, ComprovanteDTO } from '@/types/Cotaparte';

// ─── helpers de badge ────────────────────────────────────────────────────────

const statusVariant: Record<StatusCota, 'success' | 'destructive' | 'warning'> = {
  ATIVA: 'warning',
  QUITADA: 'success',
  VENCIDA: 'destructive',
};

const statusLabel: Record<StatusCota, string> = {
  ATIVA: 'Ativa',
  QUITADA: 'Quitada',
  VENCIDA: 'Vencida',
};

function CotaBadge({ status }: { status: StatusCota }) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
}

const parcelaLabel: Record<string, string> = {
  ABERTA: 'Aberta',
  PARCIAL: 'Parcial',
  QUITADA: 'Quitada',
  VENCIDA: 'Vencida',
};

const parcelaVariant: Record<string, 'outline' | 'success' | 'warning' | 'destructive'> = {
  ABERTA: 'outline',
  PARCIAL: 'warning',
  QUITADA: 'success',
  VENCIDA: 'destructive',
};

// ─── schemas ─────────────────────────────────────────────────────────────────

const criarSchema = z.object({
  cooperadoId: z.coerce.number().refine((n) => n > 0, 'Selecione o cooperado'),
  quantidadeParcelas: z.coerce.number().int().min(1).max(10),
});

const pagamentoSchema = z.object({
  valor: z.coerce
    .number()
    .positive('Informe um valor positivo')
    .refine((v) => v > 0, 'Valor deve ser maior que zero'),
});

type CriarForm = z.infer<typeof criarSchema>;
type PagamentoForm = z.infer<typeof pagamentoSchema>;

// ─── componente de linha expansível ──────────────────────────────────────────

function CotaRow({
  cota,
  onPagar,
  onDownloadRelatorio,
}: {
  cota: CotaParte;
  onPagar: (cota: CotaParte) => void;
  onDownloadRelatorio: (cota: CotaParte) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const progresso = cota.valorTotal > 0
    ? Math.round((cota.valorPago / cota.valorTotal) * 100)
    : 0;

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/40" onClick={() => setExpanded((v) => !v)}>
        <TableCell className="font-medium">{cota.cooperadoNome}</TableCell>
        <TableCell>{cota.quantidadeParcelas}x</TableCell>
        <TableCell>{formatMoeda(cota.valorTotal)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{progresso}%</span>
          </div>
        </TableCell>
        <TableCell>{formatMoeda(cota.saldoDevedor)}</TableCell>
        <TableCell>
          <CotaBadge status={cota.status} />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            {cota.status === 'ATIVA' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); onPagar(cota); }}
              >
                <CreditCard className="h-4 w-4" />
                Pagar
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onDownloadRelatorio(cota); }}
              title="Relatório"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            >
              {expanded
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={7} className="p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Parcelas */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Parcelas
                </p>
                <div className="space-y-1.5">
                  {cota.parcelas.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <span className="text-muted-foreground">
                        {p.numeroParcela}ª parcela — {formatData(p.dataVencimento)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{formatMoeda(p.valor)}</span>
                        <Badge variant={parcelaVariant[p.status]} className="text-xs">
                          {parcelaLabel[p.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagamentos realizados */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Histórico de pagamentos
                </p>
                {cota.pagamentos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
                ) : (
                  <div className="space-y-1.5">
                    {cota.pagamentos.map((pg) => (
                      <div
                        key={pg.id}
                        className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {formatData(pg.dataPagamento)} — {pg.numeroComprovante}
                        </span>
                        <span className="font-medium text-emerald-600">
                          {formatMoeda(pg.valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────

export function CotaPartePage() {
  const qc = useQueryClient();
  const [criarOpen, setCriarOpen] = useState(false);
  const [pagarCota, setPagarCota] = useState<CotaParte | null>(null);
  const [comprovante, setComprovante] = useState<ComprovanteDTO | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'all' | StatusCota>('all');
  const [search, setSearch] = useState('');

  // ── dados de todas as cotas (lista global via cooperado=all não existe;
  //    usamos a estratégia de buscar cooperados ativos e suas cotas em batch
  //    ou — mais simples — criamos um endpoint agregado no backend no futuro.
  //    Por ora buscamos por cooperado selecionado no filtro ou mostramos vazio.)
  // ── Alternativa pragmática: a página mostra cotas do cooperado buscado ──────
  const [cooperadoFiltroId, setCooperadoFiltroId] = useState<number | null>(null);

  const { data: cotas = [], isLoading } = useQuery({
    queryKey: ['cotas-parte', cooperadoFiltroId],
    queryFn: () =>
      cooperadoFiltroId
        ? cotaParteService.listarPorCooperado(cooperadoFiltroId)
        : Promise.resolve<CotaParte[]>([]),
    enabled: cooperadoFiltroId !== null,
  });

  const filtered = useMemo(() => {
    return cotas.filter((c) => {
      if (filtroStatus !== 'all' && c.status !== filtroStatus) return false;
      if (search && !c.cooperadoNome.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [cotas, filtroStatus, search]);

  // totalizadores
  const totais = useMemo(() => ({
    total: filtered.length,
    arrecadado: filtered.reduce((a, c) => a + c.valorPago, 0),
    devedor: filtered.reduce((a, c) => a + c.saldoDevedor, 0),
  }), [filtered]);

  // ── forms ─────────────────────────────────────────────────────────────────
  const formCriar = useForm<CriarForm>({
    resolver: zodResolver(criarSchema),
    defaultValues: { cooperadoId: 0, quantidadeParcelas: 10 },
  });

  const formPagar = useForm<PagamentoForm>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: { valor: 0 },
  });

  // ── mutations ──────────────────────────────────────────────────────────────
  const criarMut = useMutation({
    mutationFn: (v: CriarForm) => cotaParteService.criar(v.cooperadoId, v.quantidadeParcelas),
    onSuccess: (nova) => {
      toast.success('Cota-parte criada');
      qc.invalidateQueries({ queryKey: ['cotas-parte', nova.cooperadoId] });
      if (!cooperadoFiltroId) setCooperadoFiltroId(nova.cooperadoId);
      setCriarOpen(false);
      formCriar.reset();
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      Object.entries(fe).forEach(([k, m]) => formCriar.setError(k as keyof CriarForm, { message: m }));
      showApiError(e);
    },
  });

  const pagarMut = useMutation({
    mutationFn: (v: PagamentoForm) =>
      cotaParteService.registrarPagamento(pagarCota!.id, v.valor),
    onSuccess: (dto) => {
      toast.success('Pagamento registrado');
      qc.invalidateQueries({ queryKey: ['cotas-parte'] });
      setPagarCota(null);
      setComprovante(dto);
      formPagar.reset();
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      Object.entries(fe).forEach(([k, m]) => formPagar.setError(k as keyof PagamentoForm, { message: m }));
      showApiError(e);
    },
  });

  const handleDownloadRelatorioUma = (cota: CotaParte) => {
    downloadRelatorioCotas([cota]);
  };

  const handleDownloadRelatorioGeral = () => {
    downloadRelatorioCotas(filtered);
  };

  return (
    <div className="space-y-6">
      {/* ── filtros e ações ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Busca por cooperado */}
          <div className="w-72">
            <CooperadoPicker value={cooperadoFiltroId} onChange={setCooperadoFiltroId} />
          </div>

          {/* Filtro de status */}
          <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as typeof filtroStatus)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ATIVA">Ativa</SelectItem>
              <SelectItem value="QUITADA">Quitada</SelectItem>
              <SelectItem value="VENCIDA">Vencida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {filtered.length > 0 && (
            <Button variant="outline" onClick={handleDownloadRelatorioGeral}>
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          )}
          <Button onClick={() => setCriarOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova cota-parte
          </Button>
        </div>
      </div>

      {/* ── cards de resumo ── */}
      {cooperadoFiltroId && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cotas encontradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totais.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total arrecadado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">{formatMoeda(totais.arrecadado)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo em aberto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${totais.devedor > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {formatMoeda(totais.devedor)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── tabela ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cotas-parte</CardTitle>
        </CardHeader>
        <CardContent>
          {!cooperadoFiltroId ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Search className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Selecione um cooperado para visualizar suas cotas-parte.</p>
            </div>
          ) : isLoading ? (
            <PageLoader />
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma cota-parte encontrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cooperado</TableHead>
                    <TableHead>Parcelas</TableHead>
                    <TableHead>Valor total</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Saldo devedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((cota) => (
                    <CotaRow
                      key={cota.id}
                      cota={cota}
                      onPagar={setPagarCota}
                      onDownloadRelatorio={handleDownloadRelatorioUma}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── modal criar ── */}
      <Dialog open={criarOpen} onOpenChange={setCriarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova cota-parte</DialogTitle>
          </DialogHeader>
          <Form {...formCriar}>
            <form
              onSubmit={formCriar.handleSubmit((v) => criarMut.mutate(v))}
              className="space-y-4"
            >
              <FormField
                control={formCriar.control}
                name="cooperadoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cooperado</FormLabel>
                    <FormControl>
                      <CooperadoPicker
                        value={field.value > 0 ? field.value : null}
                        onChange={(id) => field.onChange(id ?? 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formCriar.control}
                name="quantidadeParcelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de parcelas</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}x de {formatMoeda(1000 / n)} — total {formatMoeda(1000)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                Valor fixo da cota: <span className="font-semibold text-foreground">R$ 1.000,00</span>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCriarOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={criarMut.isPending}>
                  {criarMut.isPending ? 'Criando…' : 'Criar cota-parte'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── modal pagamento ── */}
      <Dialog open={pagarCota !== null} onOpenChange={() => setPagarCota(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          {pagarCota && (
            <div className="space-y-1 rounded-md bg-muted/50 px-4 py-3 text-sm">
              <p><span className="text-muted-foreground">Cooperado:</span> {pagarCota.cooperadoNome}</p>
              <p><span className="text-muted-foreground">Saldo devedor:</span>{' '}
                <span className="font-semibold text-amber-600">{formatMoeda(pagarCota.saldoDevedor)}</span>
              </p>
              <p><span className="text-muted-foreground">Parcelas abertas:</span>{' '}
                {pagarCota.parcelas.filter((p) => p.status !== 'QUITADA').length}
              </p>
            </div>
          )}
          <Form {...formPagar}>
            <form
              onSubmit={formPagar.handleSubmit((v) => pagarMut.mutate(v))}
              className="space-y-4"
            >
              <FormField
                control={formPagar.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do pagamento (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    {pagarCota && (
                      <p className="text-xs text-muted-foreground">
                        Máximo: {formatMoeda(pagarCota.saldoDevedor)}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPagarCota(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pagarMut.isPending}>
                  {pagarMut.isPending ? 'Registrando…' : 'Confirmar pagamento'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── modal pós-pagamento: baixar comprovante ── */}
      <Dialog open={comprovante !== null} onOpenChange={() => setComprovante(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamento confirmado</DialogTitle>
          </DialogHeader>
          {comprovante && (
            <div className="space-y-3">
              <div className="space-y-1 rounded-md bg-muted/50 px-4 py-3 text-sm">
                <p><span className="text-muted-foreground">Comprovante:</span> {comprovante.numeroComprovante}</p>
                <p><span className="text-muted-foreground">Valor pago:</span>{' '}
                  <span className="font-semibold text-emerald-600">{formatMoeda(comprovante.valorPago)}</span>
                </p>
                <p><span className="text-muted-foreground">Saldo restante:</span>{' '}
                  <span className="font-semibold">{formatMoeda(comprovante.saldoDevedor)}</span>
                </p>
                <p><span className="text-muted-foreground">Status:</span>{' '}
                  <span className="font-semibold">
                    {comprovante.status === 'QUITADA' ? '✓ Cota quitada!' : `${comprovante.parcelasRestantes} parcelas restantes`}
                  </span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Deseja baixar o comprovante em PDF?</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setComprovante(null)}>
              Depois
            </Button>
            <Button
              onClick={() => {
                if (comprovante) downloadComprovanteCotaParte(comprovante);
                setComprovante(null);
              }}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}