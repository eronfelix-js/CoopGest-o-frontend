import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Package } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { CooperadoStatusBadge, PagamentoStatusBadge } from '@/components/shared/StatusBadges';
import * as cooperadosService from '@/services/cooperadosService';
import * as produtosService from '@/services/produtosService';
import * as anuidadesService from '@/services/anuidadesService';
import { useAuthStore } from '@/store/authStore';
import { formatCPF, formatData, formatMoeda, formatTelefone } from '@/utils/format';
import { getFieldErrors, showApiError } from '@/utils/errors';

const produtoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome'),
  categoria: z.string().min(1, 'Informe a categoria'),
  unidadeMedida: z.string().min(1, 'Informe a unidade'),
  descricao: z.string().optional(),
});

type ProdutoForm = z.infer<typeof produtoSchema>;

export function CooperadoDetalhePage() {
  const { id } = useParams();
  const cooperadoId = Number(id);
  const isGestor = useAuthStore((s) => s.isGestor());
  const qc = useQueryClient();
  const [prodOpen, setProdOpen] = useState(false);
  const [deleteProdId, setDeleteProdId] = useState<number | null>(null);

  // Dados do cooperado
  const { data: c, isLoading } = useQuery({
    queryKey: ['cooperados', cooperadoId],
    queryFn: () => cooperadosService.buscarPorId(cooperadoId),
    enabled: Number.isFinite(cooperadoId),
  });

  // Produtos do cooperado via endpoint dedicado — garante que a lista está sempre atualizada
  const { data: produtos = [], isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos', 'cooperado', cooperadoId],
    queryFn: () => produtosService.listarPorCooperado(cooperadoId),
    enabled: Number.isFinite(cooperadoId),
  });

  // Anuidades (só gestor)
  const { data: anuidades = [] } = useQuery({
    queryKey: ['anuidades', 'cooperado', cooperadoId],
    queryFn: () => anuidadesService.listarPorCooperado(cooperadoId),
    enabled: Number.isFinite(cooperadoId) && isGestor,
  });

  const form = useForm<ProdutoForm>({
    resolver: zodResolver(produtoSchema),
    defaultValues: { nome: '', categoria: '', unidadeMedida: '', descricao: '' },
  });

  const createProd = useMutation({
    mutationFn: (v: ProdutoForm) =>
      produtosService.criar({
        ...v,
        descricao: v.descricao || '',
        cooperadoId,
      }),
    onSuccess: () => {
      toast.success('Produto cadastrado');
      // Invalida tanto a query de produtos dedicada quanto a do cooperado
      qc.invalidateQueries({ queryKey: ['produtos', 'cooperado', cooperadoId] });
      qc.invalidateQueries({ queryKey: ['cooperados', cooperadoId] });
      qc.invalidateQueries({ queryKey: ['produtos'] });
      setProdOpen(false);
      form.reset();
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      Object.entries(fe).forEach(([k, m]) => form.setError(k as keyof ProdutoForm, { message: m }));
      showApiError(e);
    },
  });

  const deleteProd = useMutation({
    mutationFn: (pid: number) => produtosService.deletar(pid),
    onSuccess: () => {
      toast.success('Produto removido');
      qc.invalidateQueries({ queryKey: ['produtos', 'cooperado', cooperadoId] });
      qc.invalidateQueries({ queryKey: ['cooperados', cooperadoId] });
      qc.invalidateQueries({ queryKey: ['produtos'] });
      setDeleteProdId(null);
    },
    onError: (e: unknown) => showApiError(e),
  });

  if (!Number.isFinite(cooperadoId)) return <p className="text-destructive">ID inválido.</p>;
  if (isLoading) return <PageLoader />;
  if (!c) return <p>Cooperado não encontrado.</p>;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          {/* Corrigido: rota com prefixo /app/ */}
          <Link to="/app/cooperados">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold">{c.nome}</h2>
        <CooperadoStatusBadge status={c.status} />
      </div>

      {/* Dados do cooperado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">CPF:</span> {formatCPF(c.cpf)}
          </p>
          <p>
            <span className="text-muted-foreground">Telefone:</span>{' '}
            {c.telefone ? formatTelefone(c.telefone) : '—'}
          </p>
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Endereço:</span> {c.endereco || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Data de entrada:</span> {formatData(c.dataEntrada)}
          </p>
        </CardContent>
      </Card>

      {/* Produtos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            Produtos
            {produtos.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({produtos.length})
              </span>
            )}
          </CardTitle>
          <Button size="sm" onClick={() => setProdOpen(true)}>
            <Plus className="h-4 w-4" />
            Adicionar produto
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loadingProdutos ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : produtos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Package className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Nenhum produto cadastrado para este cooperado.</p>
              <Button
                variant="link"
                size="sm"
                className="mt-1"
                onClick={() => setProdOpen(true)}
              >
                Adicionar o primeiro produto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell>{p.categoria}</TableCell>
                    <TableCell>{p.unidadeMedida}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {p.descricao || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteProdId(p.id)}
                        title="Remover produto"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Histórico de anuidades — só gestor */}
      {isGestor && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de anuidades</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {anuidades.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma anuidade registrada.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anuidades.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.anoReferencia}</TableCell>
                      <TableCell>{formatMoeda(a.valor)}</TableCell>
                      <TableCell>{formatData(a.dataVencimento)}</TableCell>
                      <TableCell>
                        <PagamentoStatusBadge status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal: cadastrar produto */}
      <Dialog open={prodOpen} onOpenChange={setProdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createProd.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unidadeMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de medida</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="kg, caixa, litro…" />
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setProdOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createProd.isPending}>
                  {createProd.isPending ? 'Salvando…' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal: confirmar remoção de produto */}
      <AlertDialog open={deleteProdId !== null} onOpenChange={() => setDeleteProdId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteProdId != null) deleteProd.mutate(deleteProdId);
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