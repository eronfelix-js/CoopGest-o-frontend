import { Badge } from '@/components/ui/badge';
import type { StatusCooperado, StatusPagamento, TipoLancamento } from '@/types';

export function CooperadoStatusBadge({ status }: { status: StatusCooperado }) {
  if (status === 'ATIVO') return <Badge variant="success">Ativo</Badge>;
  return <Badge variant="muted">Inativo</Badge>;
}

export function PagamentoStatusBadge({ status }: { status: StatusPagamento }) {
  if (status === 'PAGO') return <Badge variant="success">Pago</Badge>;
  if (status === 'PENDENTE') return <Badge variant="warning">Pendente</Badge>;
  return <Badge variant="destructive">Atrasado</Badge>;
}

export function TipoLancamentoBadge({ tipo }: { tipo: TipoLancamento }) {
  if (tipo === 'ENTRADA') return <Badge variant="success">Entrada</Badge>;
  return <Badge variant="destructive">Saída</Badge>;
}
