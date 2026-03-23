import { api } from '@/services/api';
import type { Anuidade, AnuidadeRequest, PagamentoRequest } from '@/types';

export async function listar(): Promise<Anuidade[]> {
  const { data } = await api.get<Anuidade[]>('/anuidades');
  return data;
}

export async function listarAtrasadas(): Promise<Anuidade[]> {
  const { data } = await api.get<Anuidade[]>('/anuidades/atrasadas');
  return data;
}

export async function listarPorCooperado(cooperadoId: number): Promise<Anuidade[]> {
  const { data } = await api.get<Anuidade[]>(`/anuidades/cooperado/${cooperadoId}`);
  return data;
}

export async function criar(body: AnuidadeRequest): Promise<Anuidade> {
  const { data } = await api.post<Anuidade>('/anuidades', body);
  return data;
}

export async function registrarPagamento(id: number, body: PagamentoRequest): Promise<Anuidade> {
  const { data } = await api.patch<Anuidade>(`/anuidades/${id}/pagamento`, body);
  return data;
}
