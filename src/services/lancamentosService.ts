import { api } from '@/services/api';
import type { Lancamento, LancamentoRequest } from '@/types';

export async function listar(): Promise<Lancamento[]> {
  const { data } = await api.get<Lancamento[]>('/lancamentos');
  return data;
}

export async function listarPorPeriodo(inicio: string, fim: string): Promise<Lancamento[]> {
  const { data } = await api.get<Lancamento[]>('/lancamentos/periodo', {
    params: { inicio, fim },
  });
  return data;
}

export async function saldoAtual(): Promise<number> {
  const { data } = await api.get<number>('/lancamentos/saldo');
  return data;
}

export async function criar(body: LancamentoRequest): Promise<Lancamento> {
  const { data } = await api.post<Lancamento>('/lancamentos', body);
  return data;
}

export async function deletar(id: number): Promise<void> {
  await api.delete(`/lancamentos/${id}`);
}
