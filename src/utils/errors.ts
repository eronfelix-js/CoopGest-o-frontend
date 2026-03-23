import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types';

export function showApiError(error: unknown, fallback = 'Erro ao processar solicitação') {
  const ax = error as AxiosError<ErrorResponse>;
  if (!ax.response) {
    toast.error('Sem conexão com o servidor');
    return;
  }
  const { status, data } = ax.response;
  if (status === 500) {
    toast.error('Erro interno, tente novamente');
    return;
  }
  if (status === 404) {
    toast.error(data?.message || 'Recurso não encontrado');
    return;
  }
  if (status === 409) {
    toast.error(data?.message || 'Conflito ao salvar');
    return;
  }
  toast.error(data?.message || fallback);
}

export function getFieldErrors(error: unknown): Record<string, string> {
  const ax = error as AxiosError<ErrorResponse>;
  const errs = ax.response?.data?.errors;
  if (!errs?.length) return {};
  return Object.fromEntries(errs.map((e) => [e.field, e.message]));
}
