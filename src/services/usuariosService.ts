import { api } from '@/services/api';
import type { Usuario, UsuarioRequest } from '@/types';

export async function listar(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/usuarios');
  return data;
}

export async function buscarPorId(id: number): Promise<Usuario> {
  const { data } = await api.get<Usuario>(`/usuarios/${id}`);
  return data;
}

export async function criar(body: UsuarioRequest): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/usuarios', body);
  return data;
}

export async function desativar(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}
