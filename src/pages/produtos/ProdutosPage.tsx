import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  User,
  Filter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogDescription,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import * as produtosService from '@/services/produtosService';
import * as cooperadosService from '@/services/cooperadosService';
import * as estoqueService from '@/services/estoqueService';
import { showApiError } from '@/utils/errors';
import type { Produto, ProdutoRequest, Cooperado, SaldoEstoque } from '@/types';

const CATEGORIAS = [
  'Hortifruti',
  'Grãos',
  'Laticínios',
  'Carnes',
  'Ovos',
  'Mel',
  'Artesanato',
  'Outro',
];

const UNIDADES = ['kg', 'g', 'un', 'dz', 'L', 'mL', 'cx', 'pct'];

export function ProdutosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCooperado, setFilterCooperado] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [deletingProduto, setDeletingProduto] = useState<Produto | null>(null);
  const [saldos, setSaldos] = useState<Record<number, SaldoEstoque | null>>({});

  // Form state
  const [form, setForm] = useState<ProdutoRequest>({
    nome: '',
    categoria: '',
    unidadeMedida: '',
    descricao: '',
    cooperadoId: 0,
  });

  // Queries
  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: produtosService.listar,
  });

  const { data: cooperados = [] } = useQuery({
    queryKey: ['cooperados-ativos'],
    queryFn: cooperadosService.listarAtivos,
  });

  // Mutations
  const criarMutation = useMutation({
    mutationFn: produtosService.criar,
    onSuccess: () => {
      toast.success('Produto cadastrado com sucesso');
      qc.invalidateQueries({ queryKey: ['produtos'] });
      closeModal();
    },
    onError: (error) => showApiError(error),
  });

  const atualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProdutoRequest }) =>
      produtosService.atualizar(id, data),
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso');
      qc.invalidateQueries({ queryKey: ['produtos'] });
      closeModal();
    },
    onError: (error) => showApiError(error),
  });

  const deletarMutation = useMutation({
    mutationFn: produtosService.deletar,
    onSuccess: () => {
      toast.success('Produto excluído com sucesso');
      qc.invalidateQueries({ queryKey: ['produtos'] });
      setDeleteOpen(false);
      setDeletingProduto(null);
    },
    onError: (error) => {
      // Verificar se é erro de constraint (produto com estoque)
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '';
      if (errorMessage.includes('constraint') || errorMessage.includes('estoque')) {
        toast.error('Não é possível excluir um produto que possui movimentações de estoque');
      } else {
        showApiError(error);
      }
      setDeleteOpen(false);
      setDeletingProduto(null);
    },
  });

  // Buscar saldo do produto
  const fetchSaldo = async (produtoId: number) => {
    if (saldos[produtoId] !== undefined) return;
    try {
      const saldo = await estoqueService.saldoPorProduto(produtoId);
      setSaldos((prev) => ({ ...prev, [produtoId]: saldo }));
    } catch {
      setSaldos((prev) => ({ ...prev, [produtoId]: null }));
    }
  };

  // Filtros
  const filteredProdutos = produtos.filter((p) => {
    const matchSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cooperadoNome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase());
    const matchCooperado = filterCooperado === 'all' || p.cooperadoId.toString() === filterCooperado;
    const matchCategoria = filterCategoria === 'all' || p.categoria === filterCategoria;
    return matchSearch && matchCooperado && matchCategoria;
  });

  // Categorias únicas dos produtos existentes
  const categoriasExistentes = [...new Set(produtos.map((p) => p.categoria))].sort();

  // Handlers
  const openCreate = () => {
    setEditingProduto(null);
    setForm({
      nome: '',
      categoria: '',
      unidadeMedida: '',
      descricao: '',
      cooperadoId: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setForm({
      nome: produto.nome,
      categoria: produto.categoria,
      unidadeMedida: produto.unidadeMedida,
      descricao: produto.descricao,
      cooperadoId: produto.cooperadoId,
    });
    setModalOpen(true);
  };

  const openDelete = (produto: Produto) => {
    setDeletingProduto(produto);
    fetchSaldo(produto.id);
    setDeleteOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduto(null);
    setForm({
      nome: '',
      categoria: '',
      unidadeMedida: '',
      descricao: '',
      cooperadoId: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.categoria || !form.unidadeMedida || !form.cooperadoId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (editingProduto) {
      atualizarMutation.mutate({ id: editingProduto.id, data: form });
    } else {
      criarMutation.mutate(form);
    }
  };

  const handleDelete = () => {
    if (deletingProduto) {
      deletarMutation.mutate(deletingProduto.id);
    }
  };

  const isSubmitting = criarMutation.isPending || atualizarMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos dos cooperados
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cooperado ou categoria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCooperado} onValueChange={setFilterCooperado}>
              <SelectTrigger>
                <SelectValue placeholder="Cooperado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cooperados</SelectItem>
                {cooperados.map((c: Cooperado) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categoriasExistentes.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {filteredProdutos.length} produto(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            </div>
          ) : filteredProdutos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground">
                {search || filterCooperado !== 'all' || filterCategoria !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Cadastre o primeiro produto clicando em "Novo Produto"'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Cooperado</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{produto.nome}</p>
                            {produto.descricao && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {produto.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{produto.cooperadoNome}</span>
                        </div>
                      </TableCell>
                      <TableCell>{produto.categoria}</TableCell>
                      <TableCell>{produto.unidadeMedida}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(produto)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDelete(produto)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Criar/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduto
                ? 'Atualize as informações do produto'
                : 'Preencha os dados para cadastrar um novo produto'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cooperadoId">Cooperado *</Label>
              <Select
                value={form.cooperadoId ? form.cooperadoId.toString() : ''}
                onValueChange={(v) => setForm({ ...form, cooperadoId: Number(v) })}
                disabled={!!editingProduto}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cooperado" />
                </SelectTrigger>
                <SelectContent>
                  {cooperados.map((c: Cooperado) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingProduto && (
                <p className="text-xs text-muted-foreground">
                  O cooperado não pode ser alterado após o cadastro
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Alface Crespa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => setForm({ ...form, categoria: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadeMedida">Unidade *</Label>
                <Select
                  value={form.unidadeMedida}
                  onValueChange={(v) => setForm({ ...form, unidadeMedida: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((un) => (
                      <SelectItem key={un} value={un}>
                        {un}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Informações adicionais sobre o produto (opcional)"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : editingProduto ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Excluir */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingProduto && (
                <>
                  Você está prestes a excluir o produto{' '}
                  <strong>{deletingProduto.nome}</strong> de{' '}
                  <strong>{deletingProduto.cooperadoNome}</strong>.
                  {saldos[deletingProduto.id] && saldos[deletingProduto.id]!.saldo > 0 && (
                    <span className="mt-2 block text-destructive">
                      Atenção: Este produto possui saldo em estoque (
                      {saldos[deletingProduto.id]!.saldo}{' '}
                      {saldos[deletingProduto.id]!.unidadeMedida}). A exclusão pode falhar.
                    </span>
                  )}
                  <span className="mt-2 block">
                    Esta ação não pode ser desfeita.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletarMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
