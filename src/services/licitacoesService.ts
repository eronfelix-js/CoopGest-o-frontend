import { api } from '@/services/api';
import type { Licitacao, LicitacaoRequest, LicitacaoStatusRequest, StatusLicitacao } from '@/types';

export async function listar(): Promise<Licitacao[]> {
  const { data } = await api.get<Licitacao[]>('/licitacoes');
  return data;
}

export async function buscarPorId(id: number): Promise<Licitacao> {
  const { data } = await api.get<Licitacao>(`/licitacoes/${id}`);
  return data;
}

export async function listarPorStatus(status: StatusLicitacao): Promise<Licitacao[]> {
  const { data } = await api.get<Licitacao[]>(`/licitacoes/status/${status}`);
  return data;
}

export async function listarPorCooperado(cooperadoId: number): Promise<Licitacao[]> {
  const { data } = await api.get<Licitacao[]>(`/licitacoes/cooperado/${cooperadoId}`);
  return data;
}

export async function criar(body: LicitacaoRequest): Promise<Licitacao> {
  const { data } = await api.post<Licitacao>('/licitacoes', body);
  return data;
}

export async function atualizarStatus(id: number, body: LicitacaoStatusRequest): Promise<Licitacao> {
  const { data } = await api.patch<Licitacao>(`/licitacoes/${id}/status`, body);
  return data;
}
