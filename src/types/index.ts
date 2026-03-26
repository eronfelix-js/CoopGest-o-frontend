export type PerfilUsuario = 'GESTOR' | 'COLABORADOR';
export type StatusCooperado = 'ATIVO' | 'INATIVO';
export type StatusPagamento = 'PAGO' | 'PENDENTE' | 'ATRASADO';
export type TipoLancamento = 'ENTRADA' | 'SAIDA';
export type CategoriaLancamento = 'ANUIDADE' | 'VENDA' | 'DESPESA' | 'OUTRO';
export type StatusLicitacao = 'ABERTA' | 'RESERVADA' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADA';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  criadoEm: string;
}

export interface Cooperado {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  dataEntrada: string;
  status: StatusCooperado;
  produtos: Produto[];
  criadoEm: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  unidadeMedida: string;
  descricao: string;
  cooperadoId: number;
  cooperadoNome: string;
}

export interface Estoque {
  id: number;
  produtoId: number;
  produtoNome: string;
  cooperadoId: number;
  cooperadoNome: string;
  tipo: TipoLancamento;
  quantidade: number;
  data: string;
  observacao: string;
  criadoEm: string;
}

export interface SaldoEstoque {
  produtoId: number;
  produtoNome: string;
  unidadeMedida: string;
  saldo: number;
}

export interface Anuidade {
  id: number;
  cooperadoId: number;
  cooperadoNome: string;
  anoReferencia: number;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: StatusPagamento;
  numeroComprovante: string | null;
  criadoEm: string;
}

export interface Lancamento {
  id: number;
  tipo: TipoLancamento;
  categoria: CategoriaLancamento;
  valor: number;
  descricao: string;
  data: string;
  criadoEm: string;
}

/** Alinhado ao backend (campo com typo preservado). */
export interface Dashboard {
  totalCooperados: number;
  cooperadosAtivos: number;
  anuidadesAtrasadas: number;
  anuidesPendentes: number;
  saldoCaixa: number;
  totalEntradas: number;
  totalSaidas: number;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  errors?: { field: string; message: string }[];
}

export interface LicitacaoItem {
  id: number;
  cooperadoId: number;
  cooperadoNome: string;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Licitacao {
  id: number;
  numeroEdital: string;
  orgaoLicitante: string;
  valorTotal: number;
  dataAbertura: string;
  prazoEntrega: string;
  dataSaida: string | null;
  dataEntrega: string | null;
  observacao: string | null;
  status: StatusLicitacao;
  itens: LicitacaoItem[];
  criadoEm: string;
}

export interface CooperadoRequest {
  nome: string;
  cpf: string;
  telefone?: string;
  endereco?: string;
  dataEntrada: string;
}

export interface ProdutoRequest {
  nome: string;
  categoria: string;
  unidadeMedida: string;
  descricao: string;
  cooperadoId: number;
}

export interface EstoqueRequest {
  produtoId: number;
  cooperadoId: number;
  tipo: TipoLancamento;
  quantidade: number;
  data: string;
  observacao: string;
}

export interface AnuidadeRequest {
  cooperadoId: number;
  anoReferencia: number;
  valor: number;
  dataVencimento: string;
}

export interface PagamentoRequest {
  dataPagamento: string;
}

export interface LancamentoRequest {
  tipo: TipoLancamento;
  categoria: CategoriaLancamento;
  valor: number;
  descricao: string;
  data: string;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}

export interface LicitacaoItemRequest {
  cooperadoId: number;
  produtoId: number;
  quantidade: number;
  valorUnitario: number;
}

export interface LicitacaoRequest {
  numeroEdital: string;
  orgaoLicitante: string;
  valorTotal: number;
  dataAbertura: string;
  prazoEntrega: string;
  observacao?: string;
  itens: LicitacaoItemRequest[];
}

export interface LicitacaoStatusRequest {
  status: StatusLicitacao;
  dataSaida?: string;
  dataEntrega?: string;
  observacao?: string;
}

/** Corpo de `POST /auth/login` — alinhado a `LoginRequest` no backend. */
export interface LoginRequestBody {
  email: string;
  senha: string;
}

/** Resposta de `POST /auth/login` — alinhada a `LoginResponse` no backend. */
export interface LoginResponse {
  token: string;
  nome: string;
  perfil: string;
}

/**
 * JSON de `GET /auth/me` — mesmo conteúdo que `Map.of("sub", …, "roles", jwt.getClaim("roles"))`.
 * O campo `roles` reflete o claim do JWT (geralmente string com papéis separados por espaço).
 */
export interface MeResponse {
  sub: string;
  roles: unknown;
}
