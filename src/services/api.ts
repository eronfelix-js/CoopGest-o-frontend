import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const baseURL = import.meta.env.VITE_API_URL || 'https://confident-endurance-production-1d64.up.railway.app';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isPublicAuthPath(config: InternalAxiosRequestConfig) {
  const url = config.url || '';
  return url.includes('/auth/login');
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    if (!original || isPublicAuthPath(original)) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
