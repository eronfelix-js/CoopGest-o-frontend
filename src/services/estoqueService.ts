import { api } from '@/services/api';
import type { Estoque, EstoqueRequest, SaldoEstoque } from '@/types';

export async function listar(): Promise<Estoque[]> {
  const { data } = await api.get<Estoque[]>('/estoque');
  return data;
}

export async function listarPorProduto(produtoId: number): Promise<Estoque[]> {
  const { data } = await api.get<Estoque[]>(`/estoque/produto/${produtoId}`);
  return data;
}

export async function saldoPorProduto(produtoId: number): Promise<SaldoEstoque> {
  const { data } = await api.get<SaldoEstoque>(`/estoque/saldo/${produtoId}`);
  return data;
}

export async function registrar(body: EstoqueRequest): Promise<Estoque> {
  const { data } = await api.post<Estoque>('/estoque', body);
  return data;
}
