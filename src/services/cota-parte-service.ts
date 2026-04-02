import { api } from '@/services/api';
import type { CotaParte, ComprovanteDTO } from '@/types/cota-parte';


// POST /cota-parte?cooperadoId=1&quantidadeParcelas=5
export async function criar(
  cooperadoId: number,
  quantidadeParcelas: number
): Promise<CotaParte> {
  const { data } = await api.post<CotaParte>(
    `/cota-parte?cooperadoId=${cooperadoId}&quantidadeParcelas=${quantidadeParcelas}`
  );
  return data;
}

// POST /cota-parte/{id}/pagamento?valor=400.00
export async function registrarPagamento(
  cotaParteId: number,
  valor: number
): Promise<ComprovanteDTO> {
  const { data } = await api.post<ComprovanteDTO>(
    `/cota-parte/${cotaParteId}/pagamento?valor=${valor}`
  );
  return data;
}

// GET /cota-parte/{id}
export async function buscarPorId(cotaParteId: number): Promise<CotaParte> {
  const { data } = await api.get<CotaParte>(`/cota-parte/${cotaParteId}`);
  return data;
}

// GET /cota-parte/cooperado/{cooperadoId}
export async function listarPorCooperado(cooperadoId: number): Promise<CotaParte[]> {
  const { data } = await api.get<CotaParte[]>(`/cota-parte/cooperado/${cooperadoId}`);
  return data;
}