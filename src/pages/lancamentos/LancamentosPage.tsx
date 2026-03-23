import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { TipoLancamentoBadge } from '@/components/shared/StatusBadges';
import * as lancamentosService from '@/services/lancamentosService';
import { formatData, formatMoeda } from '@/utils/format';
import { getFieldErrors, showApiError } from '@/utils/errors';
import type { CategoriaLancamento, TipoLancamento } from '@/types';

const schema = z.object({
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  categoria: z.enum(['ANUIDADE', 'VENDA', 'DESPESA', 'OUTRO']),
  valor: z.coerce.number().positive(),
  descricao: z.string().min(1, 'Informe a descrição'),
  data: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

const labelsCat: Record<CategoriaLancamento, string> = {
  ANUIDADE: 'Anuidade',
  VENDA: 'Venda',
  DESPESA: 'Despesa',
  OUTRO: 'Outro',
};

export function LancamentosPage() {
  const qc = useQueryClient();
  const [inicio, setInicio] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [fim, setFim] = useState(() => new Date().toISOString().slice(0, 10));
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: saldo, isLoading: loadingSaldo } = useQuery({
    queryKey: ['lancamentos', 'saldo'],
    queryFn: lancamentosService.saldoAtual,
  });

  const { data: listaPeriodo = [], isLoading: loadingLista } = useQuery({
    queryKey: ['lancamentos', 'periodo', inicio, fim],
    queryFn: () => lancamentosService.listarPorPeriodo(inicio, fim),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: 'ENTRADA',
      categoria: 'VENDA',
      valor: 0,
      descricao: '',
      data: new Date().toISOString().slice(0, 10),
    },
  });

  const createMut = useMutation({
    mutationFn: lancamentosService.criar,
    onSuccess: () => {
      toast.success('Lançamento criado');
      qc.invalidateQueries({ queryKey: ['lancamentos'] });
      setOpen(false);
      form.reset({
        tipo: 'ENTRADA',
        categoria: 'VENDA',
        valor: 0,
        descricao: '',
        data: new Date().toISOString().slice(0, 10),
      });
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      Object.entries(fe).forEach(([k, m]) => form.setError(k as keyof FormValues, { message: m }));
      showApiError(e);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => lancamentosService.deletar(id),
    onSuccess: () => {
      toast.success('Lançamento removido');
      qc.invalidateQueries({ queryKey: ['lancamentos'] });
      setDeleteId(null);
    },
    onError: (e: unknown) => showApiError(e),
  });

  const saldoNum = useMemo(() => Number(saldo ?? 0), [saldo]);

  if (loadingSaldo || loadingLista) return <PageLoader />;

  return (
    <div className="space-y-8">
      <Card
        className={
          saldoNum >= 0
            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30'
            : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30'
        }
      >
        <CardHeader>
          <CardTitle className="text-base">Saldo atual do caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${saldoNum >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatMoeda(saldoNum)}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Início</label>
          <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Fim</label>
          <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
        </div>
        <Button className="sm:mb-0.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lançamentos no período</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listaPeriodo.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{formatData(l.data)}</TableCell>
                  <TableCell>
                    <TipoLancamentoBadge tipo={l.tipo} />
                  </TableCell>
                  <TableCell>{labelsCat[l.categoria]}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{l.descricao}</TableCell>
                  <TableCell className={l.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'}>
                    {l.tipo === 'ENTRADA' ? '+' : '-'}
                    {formatMoeda(l.valor)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(l.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo lançamento</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createMut.mutate(v))} className="space-y-4">
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
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as CategoriaLancamento)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(labelsCat) as CategoriaLancamento[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {labelsCat[k]}
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
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId != null) deleteMut.mutate(deleteId);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
