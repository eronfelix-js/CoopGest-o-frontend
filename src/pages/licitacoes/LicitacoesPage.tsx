import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Eye,
  Trash2,
  ArrowRight,
  FileText,
  Building2,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { LicitacaoStatusBadge } from '@/components/shared/StatusBadges';
import { CooperadoPicker } from '@/components/shared/CooperadoPicker';
import * as licitacoesService from '@/services/licitacoesService';
import * as produtosService from '@/services/produtosService';
import { formatData, formatMoeda } from '@/utils/format';
import { getFieldErrors, showApiError } from '@/utils/errors';
import type { Licitacao, StatusLicitacao } from '@/types';
import { useAuthStore } from '@/store/authStore';

const itemSchema = z.object({
  cooperadoId: z.coerce.number().min(1, 'Selecione o cooperado'),
  produtoId: z.coerce.number().min(1, 'Selecione o produto'),
  quantidade: z.coerce.number().positive('Quantidade deve ser maior que 0'),
  valorUnitario: z.coerce.number().positive('Valor deve ser maior que 0'),
});

const licitacaoSchema = z.object({
  numeroEdital: z.string().min(1, 'Número do edital é obrigatório'),
  orgaoLicitante: z.string().min(1, 'Órgão licitante é obrigatório'),
  valorTotal: z.coerce.number().positive('Valor total deve ser maior que 0'),
  dataAbertura: z.string().min(1, 'Data de abertura é obrigatória'),
  prazoEntrega: z.string().min(1, 'Prazo de entrega é obrigatório'),
  observacao: z.string().optional(),
  itens: z.array(itemSchema).min(1, 'Adicione pelo menos um item'),
});

type LicitacaoForm = z.infer<typeof licitacaoSchema>;

const statusLabels: Record<StatusLicitacao, string> = {
  ABERTA: 'Aberta',
  RESERVADA: 'Reservada',
  EM_TRANSITO: 'Em Trânsito',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
};

const validTransitions: Record<StatusLicitacao, StatusLicitacao[]> = {
  ABERTA: ['RESERVADA', 'CANCELADA'],
  RESERVADA: ['EM_TRANSITO', 'CANCELADA'],
  EM_TRANSITO: ['ENTREGUE', 'CANCELADA'],
  ENTREGUE: [],
  CANCELADA: [],
};

export function LicitacoesPage() {
  const qc = useQueryClient();
  const isGestor = useAuthStore((s) => s.isGestor());
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedLicitacao, setSelectedLicitacao] = useState<Licitacao | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('all');

  const { data: licitacoes = [], isLoading } = useQuery({
    queryKey: ['licitacoes', filtroStatus],
    queryFn: () =>
      filtroStatus === 'all'
        ? licitacoesService.listar()
        : licitacoesService.listarPorStatus(filtroStatus as StatusLicitacao),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: produtosService.listar,
  });

  const form = useForm<LicitacaoForm>({
    resolver: zodResolver(licitacaoSchema),
    defaultValues: {
      numeroEdital: '',
      orgaoLicitante: '',
      valorTotal: 0,
      dataAbertura: new Date().toISOString().slice(0, 10),
      prazoEntrega: '',
      observacao: '',
      itens: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  });

  const createMut = useMutation({
    mutationFn: licitacoesService.criar,
    onSuccess: () => {
      toast.success('Licitação cadastrada com sucesso');
      qc.invalidateQueries({ queryKey: ['licitacoes'] });
      setCreateOpen(false);
      form.reset();
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      Object.entries(fe).forEach(([k, m]) => form.setError(k as keyof LicitacaoForm, { message: m }));
      showApiError(e);
    },
  });

  const statusForm = useForm({
    defaultValues: {
      status: '' as StatusLicitacao,
      dataSaida: new Date().toISOString().slice(0, 10),
      dataEntrega: new Date().toISOString().slice(0, 10),
      observacao: '',
    },
  });

  const statusMut = useMutation({
    mutationFn: (body: { id: number; status: StatusLicitacao; dataSaida?: string; dataEntrega?: string; observacao?: string }) =>
      licitacoesService.atualizarStatus(body.id, {
        status: body.status,
        dataSaida: body.dataSaida,
        dataEntrega: body.dataEntrega,
        observacao: body.observacao,
      }),
    onSuccess: () => {
      toast.success('Status atualizado com sucesso');
      qc.invalidateQueries({ queryKey: ['licitacoes'] });
      setStatusOpen(false);
      setSelectedLicitacao(null);
    },
    onError: (error) => showApiError(error),
  });

  const handleOpenDetail = (lic: Licitacao) => {
    setSelectedLicitacao(lic);
    setDetailOpen(true);
  };

  const handleOpenStatus = (lic: Licitacao) => {
    setSelectedLicitacao(lic);
    statusForm.reset({
      status: '' as StatusLicitacao,
      dataSaida: new Date().toISOString().slice(0, 10),
      dataEntrega: new Date().toISOString().slice(0, 10),
      observacao: '',
    });
    setStatusOpen(true);
  };

  const onStatusSubmit = statusForm.handleSubmit((values) => {
    if (!selectedLicitacao || !values.status) return;
    statusMut.mutate({
      id: selectedLicitacao.id,
      status: values.status,
      dataSaida: values.status === 'EM_TRANSITO' ? values.dataSaida : undefined,
      dataEntrega: values.status === 'ENTREGUE' ? values.dataEntrega : undefined,
      observacao: values.status === 'CANCELADA' ? values.observacao : undefined,
    });
  });

  const calcularTotalItens = () => {
    const itens = form.watch('itens');
    return itens.reduce((acc, item) => acc + (item.quantidade || 0) * (item.valorUnitario || 0), 0);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {isGestor && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova Licitação
            </Button>
          )}
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Licitações
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Edital</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Prazo Entrega</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licitacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma licitação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                licitacoes.map((lic) => (
                  <TableRow key={lic.id}>
                    <TableCell className="font-medium">{lic.numeroEdital}</TableCell>
                    <TableCell>{lic.orgaoLicitante}</TableCell>
                    <TableCell>{formatMoeda(lic.valorTotal)}</TableCell>
                    <TableCell>{formatData(lic.dataAbertura)}</TableCell>
                    <TableCell>{formatData(lic.prazoEntrega)}</TableCell>
                    <TableCell>
                      <LicitacaoStatusBadge status={lic.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDetail(lic)} title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isGestor && validTransitions[lic.status].length > 0 && (
                          <Button variant="ghost" size="icon" onClick={() => handleOpenStatus(lic)} title="Alterar status">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Criar Licitação */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Licitação</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createMut.mutate(v))} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="numeroEdital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Edital</FormLabel>
                      <FormControl>
                        <Input placeholder="EDI-2025-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orgaoLicitante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Órgão Licitante</FormLabel>
                      <FormControl>
                        <Input placeholder="Prefeitura de..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="valorTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataAbertura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Abertura</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prazoEntrega"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de Entrega</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Merenda escolar — Lote 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">Itens da Licitação</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ cooperadoId: 0, produtoId: 0, quantidade: 0, valorUnitario: 0 })}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum item adicionado</p>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <FormField
                              control={form.control}
                              name={`itens.${index}.cooperadoId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Cooperado</FormLabel>
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
                              control={form.control}
                              name={`itens.${index}.produtoId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Produto</FormLabel>
                                  <Select
                                    value={field.value > 0 ? String(field.value) : ''}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {produtos.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                          {p.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`itens.${index}.quantidade`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Quantidade</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.001" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`itens.${index}.valorUnitario`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Valor Unit. (R$)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-6 shrink-0"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <div className="text-right text-sm">
                      <span className="text-muted-foreground">Total dos itens: </span>
                      <span className="font-medium">{formatMoeda(calcularTotalItens())}</span>
                    </div>
                  </div>
                )}
                {form.formState.errors.itens?.message && (
                  <p className="mt-2 text-sm text-destructive">{form.formState.errors.itens.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMut.isPending}>
                  {createMut.isPending ? 'Salvando…' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes da Licitação
            </DialogTitle>
          </DialogHeader>
          {selectedLicitacao && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Número do Edital</p>
                  <p className="font-medium">{selectedLicitacao.numeroEdital}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Órgão Licitante</p>
                  <p className="font-medium flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {selectedLicitacao.orgaoLicitante}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                  <p className="font-medium text-primary">{formatMoeda(selectedLicitacao.valorTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <LicitacaoStatusBadge status={selectedLicitacao.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data de Abertura</p>
                  <p className="font-medium">{formatData(selectedLicitacao.dataAbertura)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prazo de Entrega</p>
                  <p className="font-medium">{formatData(selectedLicitacao.prazoEntrega)}</p>
                </div>
                {selectedLicitacao.dataSaida && (
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Saída</p>
                    <p className="font-medium">{formatData(selectedLicitacao.dataSaida)}</p>
                  </div>
                )}
                {selectedLicitacao.dataEntrega && (
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Entrega</p>
                    <p className="font-medium">{formatData(selectedLicitacao.dataEntrega)}</p>
                  </div>
                )}
              </div>

              {selectedLicitacao.observacao && (
                <div>
                  <p className="text-xs text-muted-foreground">Observação</p>
                  <p className="text-sm">{selectedLicitacao.observacao}</p>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <Package className="h-4 w-4" />
                  Itens ({selectedLicitacao.itens.length})
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cooperado</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedLicitacao.itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.cooperadoNome}</TableCell>
                        <TableCell>{item.produtoNome}</TableCell>
                        <TableCell className="text-right">{item.quantidade}</TableCell>
                        <TableCell className="text-right">{formatMoeda(item.valorUnitario)}</TableCell>
                        <TableCell className="text-right font-medium">{formatMoeda(item.valorTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Alterar Status */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
          </DialogHeader>
          {selectedLicitacao && (
            <form onSubmit={onStatusSubmit} className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Licitação</p>
                <p className="font-medium">{selectedLicitacao.numeroEdital}</p>
                <div className="mt-1">
                  <LicitacaoStatusBadge status={selectedLicitacao.status} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Novo Status</label>
                  <Select
                    value={statusForm.watch('status')}
                    onValueChange={(v) => statusForm.setValue('status', v as StatusLicitacao)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o novo status" />
                    </SelectTrigger>
                    <SelectContent>
                      {validTransitions[selectedLicitacao.status].map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {statusForm.watch('status') === 'EM_TRANSITO' && (
                  <div>
                    <label className="text-sm font-medium">Data de Saída</label>
                    <Input
                      type="date"
                      value={statusForm.watch('dataSaida')}
                      onChange={(e) => statusForm.setValue('dataSaida', e.target.value)}
                    />
                  </div>
                )}

                {statusForm.watch('status') === 'ENTREGUE' && (
                  <div>
                    <label className="text-sm font-medium">Data de Entrega</label>
                    <Input
                      type="date"
                      value={statusForm.watch('dataEntrega')}
                      onChange={(e) => statusForm.setValue('dataEntrega', e.target.value)}
                    />
                  </div>
                )}

                {statusForm.watch('status') === 'CANCELADA' && (
                  <div>
                    <label className="text-sm font-medium">Motivo do Cancelamento</label>
                    <Textarea
                      placeholder="Informe o motivo do cancelamento"
                      value={statusForm.watch('observacao')}
                      onChange={(e) => statusForm.setValue('observacao', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStatusOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={statusMut.isPending || !statusForm.watch('status')}>
                  {statusMut.isPending ? 'Salvando…' : 'Confirmar'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
