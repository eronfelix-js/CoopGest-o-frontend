import { api } from '@/services/api';
import type { Produto, ProdutoRequest } from '@/types';

export async function listar(): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>('/produtos');
  return data;
}

export async function listarPorCooperado(cooperadoId: number): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>(`/produtos/cooperado/${cooperadoId}`);
  return data;
}

export async function buscarPorId(id: number): Promise<Produto> {
  const { data } = await api.get<Produto>(`/produtos/${id}`);
  return data;
}

export async function criar(body: ProdutoRequest): Promise<Produto> {
  const { data } = await api.post<Produto>('/produtos', body);
  return data;
}

export async function atualizar(id: number, body: ProdutoRequest): Promise<Produto> {
  const { data } = await api.put<Produto>(`/produtos/${id}`, body);
  return data;
}

export async function deletar(id: number): Promise<void> {
  await api.delete(`/produtos/${id}`);
}
