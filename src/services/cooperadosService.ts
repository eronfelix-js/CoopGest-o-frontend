import { api } from '@/services/api';
import type { Cooperado, CooperadoRequest } from '@/types';

export async function listar(): Promise<Cooperado[]> {
  const { data } = await api.get<Cooperado[]>('/cooperados');
  return data;
}

export async function listarAtivos(): Promise<Cooperado[]> {
  const { data } = await api.get<Cooperado[]>('/cooperados/ativos');
  return data;
}

export async function buscarPorId(id: number): Promise<Cooperado> {
  const { data } = await api.get<Cooperado>(`/cooperados/${id}`);
  return data;
}

export async function criar(body: CooperadoRequest): Promise<Cooperado> {
  const { data } = await api.post<Cooperado>('/cooperados', body);
  return data;
}

export async function atualizar(id: number, body: CooperadoRequest): Promise<Cooperado> {
  const { data } = await api.put<Cooperado>(`/cooperados/${id}`, body);
  return data;
}

export async function inativar(id: number): Promise<void> {
  await api.delete(`/cooperados/${id}`);
}
