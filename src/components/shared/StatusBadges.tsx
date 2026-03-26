import { Badge } from '@/components/ui/badge';
import type { StatusCooperado, StatusLicitacao, StatusPagamento, TipoLancamento } from '@/types';

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

export function LicitacaoStatusBadge({ status }: { status: StatusLicitacao }) {
  switch (status) {
    case 'ABERTA':
      return <Badge variant="outline">Aberta</Badge>;
    case 'RESERVADA':
      return <Badge variant="warning">Reservada</Badge>;
    case 'EM_TRANSITO':
      return <Badge variant="default">Em Trânsito</Badge>;
    case 'ENTREGUE':
      return <Badge variant="success">Entregue</Badge>;
    case 'CANCELADA':
      return <Badge variant="destructive">Cancelada</Badge>;
    default:
      return <Badge variant="muted">{status}</Badge>;
  }
}
