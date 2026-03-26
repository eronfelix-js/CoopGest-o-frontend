import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Eye, UserX, Search } from 'lucide-react';
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
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { CooperadoStatusBadge } from '@/components/shared/StatusBadges';
import * as cooperadosService from '@/services/cooperadosService';
import { formatCPF, formatData, formatTelefone, stripCPF, stripTelefone } from '@/utils/format';
import { getFieldErrors, showApiError } from '@/utils/errors';
import type { Cooperado, StatusCooperado } from '@/types';

const cooperadoSchema = z.object({
  nome: z.string().min(2, 'Informe o nome'),
  cpf: z
    .string()
    .transform((s) => stripCPF(s))
    .refine((s) => s.length === 11, 'CPF deve ter 11 dígitos'),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  dataEntrada: z.string().min(1, 'Informe a data'),
});

type CooperadoForm = z.infer<typeof cooperadoSchema>;

function maskCpfInput(v: string) {
  const d = stripCPF(v).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskTelInput(v: string) {
  const d = stripTelefone(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function CooperadosPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | StatusCooperado>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cooperado | null>(null);
  const [inativarId, setInativarId] = useState<number | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['cooperados'],
    queryFn: cooperadosService.listar,
  });

  const filtered = useMemo(() => {
    if (!rows.length) return [];
    const q = search.trim().toLowerCase();
    const qDigits = stripCPF(search);
    return rows.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      if (c.nome.toLowerCase().includes(q)) return true;
      if (qDigits && stripCPF(c.cpf).includes(qDigits)) return true;
      return false;
    });
  }, [rows, statusFilter, search]);

  const form = useForm<CooperadoForm>({
    resolver: zodResolver(cooperadoSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      endereco: '',
      dataEntrada: '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (v: CooperadoForm) => {
      const body = {
        nome: v.nome,
        cpf: v.cpf,
        telefone: v.telefone ? stripTelefone(v.telefone) : undefined,
        endereco: v.endereco || undefined,
        dataEntrada: v.dataEntrada,
      };
      if (editing) return cooperadosService.atualizar(editing.id, body);
      return cooperadosService.criar(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Cooperado atualizado' : 'Cooperado cadastrado');
      qc.invalidateQueries({ queryKey: ['cooperados'] });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e) => {
      const fe = getFieldErrors(e);
      if (Object.keys(fe).length) {
        Object.entries(fe).forEach(([k, m]) => {
          form.setError(k as keyof CooperadoForm, { message: m });
        });
      }
      showApiError(e);
    },
  });

  const inativarMutation = useMutation({
    mutationFn: (id: number) => cooperadosService.inativar(id),
    onSuccess: () => {
      toast.success('Cooperado inativado');
      qc.invalidateQueries({ queryKey: ['cooperados'] });
      setInativarId(null);
    },
    onError: (e: unknown) => showApiError(e),
  });

  const openNew = () => {
    setEditing(null);
    form.reset({
      nome: '',
      cpf: '',
      telefone: '',
      endereco: '',
      dataEntrada: new Date().toISOString().slice(0, 10),
    });
    setDialogOpen(true);
  };

  const openEdit = (c: Cooperado) => {
    setEditing(c);
    form.reset({
      nome: c.nome,
      cpf: maskCpfInput(c.cpf),
      telefone: c.telefone ? maskTelInput(c.telefone) : '',
      endereco: c.endereco || '',
      dataEntrada: c.dataEntrada.slice(0, 10),
    });
    setDialogOpen(true);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ATIVO">Ativo</SelectItem>
              <SelectItem value="INATIVO">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo cooperado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de cooperados</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>{formatCPF(c.cpf)}</TableCell>
                  <TableCell>{c.telefone ? formatTelefone(c.telefone) : '—'}</TableCell>
                  <TableCell>{formatData(c.dataEntrada)}</TableCell>
                  <TableCell>
                    <CooperadoStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Detalhes">
                        <Link to={`/app/cooperados/${c.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {c.status === 'ATIVO' && (
                        <Button variant="ghost" size="icon" title="Inativar" onClick={() => setInativarId(c.id)}>
                          <UserX className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar cooperado' : 'Novo cooperado'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
              className="space-y-4"
            >
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
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => field.onChange(maskCpfInput(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => field.onChange(maskTelInput(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataEntrada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de entrada</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando…' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={inativarId !== null} onOpenChange={() => setInativarId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar cooperado?</AlertDialogTitle>
            <AlertDialogDescription>
              O registro será inativado. Esta ação pode ser revertida apenas pelo administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (inativarId != null) inativarMutation.mutate(inativarId);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
