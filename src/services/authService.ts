import axios from 'axios';
import { api } from '@/services/api';
import type { LoginRequestBody, LoginResponse, MeResponse } from '@/types';

//const baseURL = import.meta.env.VITE_API_URL;
const baseURL = 'http://localhost:8080';
/** `POST /auth/login` — público, sem `Authorization`. */
export async function login(email: string, senha: string): Promise<LoginResponse> {
  const body: LoginRequestBody = { email, senha };
  const { data } = await axios.post<LoginResponse>(`${baseURL}/auth/login`, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

/** `GET /auth/me` — retorna `sub` e `roles` do JWT. */
export async function me(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me');
  return data;
}