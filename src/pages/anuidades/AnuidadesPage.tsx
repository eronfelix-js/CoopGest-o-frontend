import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { PagamentoStatusBadge } from '@/components/shared/StatusBadges';
import { CooperadoPicker } from '@/components/shared/CooperadoPicker';
import * as anuidadesService from '@/services/anuidadesService';
import * as cooperadosService from '@/services/cooperadosService';
import { formatData, formatMoeda } from '@/utils/format';
import { downloadComprovanteAnuidade } from '@/utils/pdf';
import { getFieldErrors, showApiError } from '@/utils/errors';
import type { Anuidade, StatusPagamento } from '@/types';

const novaSchema = z.object({
  cooperadoId: z.coerce.number().refine((n) => n > 0, 'Selecione o cooperado'),
  anoReferencia: z.coerce.number().int().min(2000).max(2100),
  valor: z.coerce.number().positive(),
  dataVencimento: z.string().min(1),
});

const pagamentoSchema = z.object({
  dataPagamento: z.string().min(1),
});

type NovaForm = z.infer<typeof novaSchema>;
type PagForm = z.infer<typeof pagamentoSchema>;

export function AnuidadesPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | StatusPagamento>('all');
  const [anoFilter, setAnoFilter] = useState<string>('all');
  const [novaOpen, setNovaOpen] = useState(false);
  const [pagRow, setPagRow] = useState<Anuidade | null>(null);
  const [lastPaid, setLastPaid] = useState<Anuidade | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['anuidades'],
    queryFn: anuidadesService.listar,
  });

  const anos = useMemo(() => {
    const s = new Set(rows.map((r) => r.anoReferencia));
    return Array.from(s).sort((a, b) => b - a);
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (anoFilter !== 'all' && String(r.anoReferencia) !== anoFilter) return false;
      return true;
    });
  }, [rows, statusFilter, anoFilter]);

  const formNova = useForm<NovaForm>({
    resolver: zodResolver(novaSchema),
    defaultValues: {
      cooperadoId: 0,
      anoReferencia: new Date().getFullYear(),
      valor: 0,
      dataVencimento: '',
    },
  });

  const formPag = useForm<PagForm>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: { dataPagamento: new Date().toISOString().slice(0, 10) },
  });

  const createMut = useMutation({
    mutationFn: anuidadesService.criar,
    onSuccess: () => {
      toast.success('Anuidade criada');
      qc.invalidateQueries({ queryKey: ['anuidades'] });
      setNovaOpen(false);
      formNova.reset();
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      Object.entries(fe).forEach(([k, m]) => formNova.setError(k as keyof NovaForm, { message: m }));
      showApiError(e);
    },
  });

  const pagMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PagForm }) =>
      anuidadesService.registrarPagamento(id, { dataPagamento: data.dataPagamento }),
    onSuccess: (updated) => {
      toast.success('Pagamento registrado');
      qc.invalidateQueries({ queryKey: ['anuidades'] });
      setPagRow(null);
      setLastPaid(updated);
      formPag.reset({ dataPagamento: new Date().toISOString().slice(0, 10) });
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      Object.entries(fe).forEach(([k, m]) => formPag.setError(k as keyof PagForm, { message: m }));
      showApiError(e);
    },
  });

  const openPagamento = (a: Anuidade) => {
    setPagRow(a);
    formPag.reset({ dataPagamento: new Date().toISOString().slice(0, 10) });
  };

  const downloadComprovante = async (a: Anuidade) => {
    if (!a.numeroComprovante || !a.dataPagamento) return;
    const coop = await cooperadosService.buscarPorId(a.cooperadoId);
    downloadComprovanteAnuidade({
      numeroComprovante: a.numeroComprovante,
      cooperadoNome: a.cooperadoNome,
      cooperadoCpf: coop.cpf,
      anoReferencia: a.anoReferencia,
      valor: a.valor,
      dataVencimento: a.dataVencimento,
      dataPagamento: a.dataPagamento,
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PAGO">Pago</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="ATRASADO">Atrasado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={anoFilter} onValueChange={setAnoFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {anos.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setNovaOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova anuidade
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anuidades</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cooperado</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.cooperadoNome}</TableCell>
                  <TableCell>{a.anoReferencia}</TableCell>
                  <TableCell>{formatMoeda(a.valor)}</TableCell>
                  <TableCell>{formatData(a.dataVencimento)}</TableCell>
                  <TableCell>
                    <PagamentoStatusBadge status={a.status} />
                  </TableCell>
                  <TableCell>{a.dataPagamento ? formatData(a.dataPagamento) : '—'}</TableCell>
                  <TableCell className="text-xs">{a.numeroComprovante ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    {a.status !== 'PAGO' && (
                      <Button size="sm" variant="secondary" onClick={() => openPagamento(a)}>
                        Registrar pagamento
                      </Button>
                    )}
                    {a.status === 'PAGO' && a.numeroComprovante && (
                      <Button size="sm" variant="outline" onClick={() => downloadComprovante(a)}>
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova anuidade</DialogTitle>
          </DialogHeader>
          <Form {...formNova}>
            <form
              onSubmit={formNova.handleSubmit((v) =>
                createMut.mutate({
                  cooperadoId: v.cooperadoId,
                  anoReferencia: v.anoReferencia,
                  valor: v.valor,
                  dataVencimento: v.dataVencimento,
                })
              )}
              className="space-y-4"
            >
              <FormField
                control={formNova.control}
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
                control={formNova.control}
                name="anoReferencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de referência</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formNova.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formNova.control}
                name="dataVencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNovaOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMut.isPending}>
                  {createMut.isPending ? 'Salvando…' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={pagRow !== null} onOpenChange={() => setPagRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          {pagRow && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Cooperado:</span> {pagRow.cooperadoNome}
              </p>
              <p>
                <span className="text-muted-foreground">Ano:</span> {pagRow.anoReferencia}
              </p>
              <p>
                <span className="text-muted-foreground">Valor:</span> {formatMoeda(pagRow.valor)}
              </p>
            </div>
          )}
          <Form {...formPag}>
            <form
              onSubmit={formPag.handleSubmit((v) => pagRow && pagMut.mutate({ id: pagRow.id, data: v }))}
              className="space-y-4"
            >
              <FormField
                control={formPag.control}
                name="dataPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do pagamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => setPagRow(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pagMut.isPending}>
                  {pagMut.isPending ? 'Salvando…' : 'Confirmar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={lastPaid !== null} onOpenChange={() => setLastPaid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamento registrado</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Deseja baixar o comprovante em PDF?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLastPaid(null)}>
              Depois
            </Button>
            <Button
              onClick={() => {
                if (lastPaid) downloadComprovante(lastPaid);
                setLastPaid(null);
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
