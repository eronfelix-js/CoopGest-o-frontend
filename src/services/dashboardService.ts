import { api } from '@/services/api';
import type { Dashboard } from '@/types';

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await api.get<Dashboard>('/dashboard');
  return data;
}
