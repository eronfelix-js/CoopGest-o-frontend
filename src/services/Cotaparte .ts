export type StatusCota = 'ATIVA' | 'QUITADA' | 'VENCIDA';
export type StatusParcela = 'ABERTA' | 'PARCIAL' | 'QUITADA' | 'VENCIDA';

export interface ParcelaCotaParte {
  id: number;
  numeroParcela: number;
  valor: number;
  dataVencimento: string;
  status: StatusParcela;
}

export interface PagamentoCotaParte {
  id: number;
  valor: number;
  dataPagamento: string;
  numeroComprovante: string;
}

export interface CotaParte {
  id: number;
  cooperadoId: number;
  cooperadoNome: string;
  cooperadoCpf?: string;
  quantidadeParcelas: number;
  valorTotal: number;
  valorPago: number;
  saldoDevedor: number;
  status: StatusCota;
  parcelas: ParcelaCotaParte[];
  pagamentos: PagamentoCotaParte[];
  criadoEm: string;
}

export interface ComprovanteDTO {
  id: number;
  numeroComprovante: string;
  dataPagamento: string;
  valorPago: number;
  saldoDevedor: number;
  valorTotal: number;
  cooperadoNome: string;
  cooperadoCpf: string;
  parcelasRestantes: number;
  status: StatusCota;
}

export interface CotaParteCreateRequest {
  cooperadoId: number;
  quantidadeParcelas: number;
}