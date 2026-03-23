import { useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PackagePlus, List } from 'lucide-react';
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
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { TipoLancamentoBadge } from '@/components/shared/StatusBadges';
import { CooperadoPicker } from '@/components/shared/CooperadoPicker';
import * as produtosService from '@/services/produtosService';
import * as estoqueService from '@/services/estoqueService';
import { formatData } from '@/utils/format';
import { getFieldErrors, showApiError } from '@/utils/errors';
import type { Estoque, TipoLancamento } from '@/types';

const movSchema = z.object({
  produtoId: z.coerce.number().min(1, 'Selecione o produto'),
  cooperadoId: z.coerce.number().min(1, 'Selecione o cooperado'),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  quantidade: z.coerce.number().positive(),
  data: z.string().min(1),
  observacao: z.string().optional(),
});

type MovForm = z.infer<typeof movSchema>;

export function EstoquePage() {
  const qc = useQueryClient();
  const [regOpen, setRegOpen] = useState(false);
  const [movOpen, setMovOpen] = useState(false);
  const [filtroProduto, setFiltroProduto] = useState<string>('all');

  const { data: produtos = [], isLoading: loadingProd } = useQuery({
    queryKey: ['produtos'],
    queryFn: produtosService.listar,
  });

  const saldoQueries = useQueries({
    queries: produtos.map((p) => ({
      queryKey: ['estoque', 'saldo', p.id],
      queryFn: () => estoqueService.saldoPorProduto(p.id),
      enabled: produtos.length > 0,
    })),
  });

  const saldosLoading = saldoQueries.some((q) => q.isLoading);
  const rows = useMemo(() => {
    return produtos.map((p, i) => {
      const s = saldoQueries[i]?.data;
      return {
        produto: p,
        saldo: s?.saldo ?? 0,
        unidade: s?.unidadeMedida ?? p.unidadeMedida,
      };
    });
  }, [produtos, saldoQueries]);

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['estoque', 'mov', filtroProduto],
    queryFn: () =>
      filtroProduto === 'all'
        ? estoqueService.listar()
        : estoqueService.listarPorProduto(Number(filtroProduto)),
    enabled: movOpen,
  });

  const form = useForm<MovForm>({
    resolver: zodResolver(movSchema),
    defaultValues: {
      produtoId: 0,
      cooperadoId: 0,
      tipo: 'ENTRADA',
      quantidade: 0,
      data: new Date().toISOString().slice(0, 10),
      observacao: '',
    },
  });

  const saveMut = useMutation({
    mutationFn: estoqueService.registrar,
    onSuccess: () => {
      toast.success('Movimentação registrada');
      qc.invalidateQueries({ queryKey: ['estoque'] });
      qc.invalidateQueries({ queryKey: ['produtos'] });
      setRegOpen(false);
      form.reset({
        produtoId: 0,
        cooperadoId: 0,
        tipo: 'ENTRADA',
        quantidade: 0,
        data: new Date().toISOString().slice(0, 10),
        observacao: '',
      });
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      Object.entries(fe).forEach(([k, m]) => form.setError(k as keyof MovForm, { message: m }));
      showApiError(e);
    },
  });

  if (loadingProd || saldosLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setRegOpen(true)}>
          <PackagePlus className="h-4 w-4" />
          Registrar movimentação
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setFiltroProduto('all');
            setMovOpen(true);
          }}
        >
          <List className="h-4 w-4" />
          Ver movimentações
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saldos por produto</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ produto, saldo, unidade }) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>{unidade}</TableCell>
                  <TableCell>{saldo}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFiltroProduto(String(produto.id));
                        setMovOpen(true);
                      }}
                    >
                      Movimentações
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={regOpen} onOpenChange={setRegOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar movimentação</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => saveMut.mutate({ ...v, observacao: v.observacao || '' }))} className="space-y-4">
              <FormField
                control={form.control}
                name="produtoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
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
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={(v) => field.onChange(v as TipoLancamento)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ENTRADA">Entrada</SelectItem>
                        <SelectItem value="SAIDA">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRegOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMut.isPending}>
                  {saveMut.isPending ? 'Salvando…' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={movOpen} onOpenChange={setMovOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Movimentações</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <Select value={filtroProduto} onValueChange={setFiltroProduto}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Filtrar por produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cooperado</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Obs.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoes.map((m: Estoque) => (
                <TableRow key={m.id}>
                  <TableCell>{formatData(m.data)}</TableCell>
                  <TableCell>
                    <TipoLancamentoBadge tipo={m.tipo} />
                  </TableCell>
                  <TableCell>{m.cooperadoNome}</TableCell>
                  <TableCell>{m.quantidade}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{m.observacao || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
