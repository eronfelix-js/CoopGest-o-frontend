import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  extractRolesFromPayload,
  extractSubject,
  getExpiresInSecondsFromJwt,
  parseJwtPayload,
} from '@/utils/jwt';
import type { LoginResponse } from '@/types';

const STORAGE_KEY = 'coop-auth';

export interface AuthState {
  accessToken: string | null;
  expiresAt: number | null;
  userEmail: string | null;
  userName: string | null;
  roles: string[];
  setFromLoginResponse: (r: LoginResponse) => void;
  setUserProfile: (nome: string | null) => void;
  logout: () => void;
  isGestor: () => boolean;
  isColaborador: () => boolean;
  /** Retorna true se há token e ele ainda não expirou */
  isSessionValid: () => boolean;
  /** Segundos restantes até expiração (0 se já expirado) */
  secondsUntilExpiry: () => number;
}

function applyAccessToken(
  access: string
): Pick<AuthState, 'accessToken' | 'expiresAt' | 'userEmail' | 'roles'> {
  const payload = parseJwtPayload(access);
  const roles = extractRolesFromPayload(payload);
  const sub = extractSubject(payload);
  const expiresIn = getExpiresInSecondsFromJwt(access);
  return {
    accessToken: access,
    expiresAt: Date.now() + expiresIn * 1000,
    userEmail: sub,
    roles,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      expiresAt: null,
      userEmail: null,
      userName: null,
      roles: [],

      setFromLoginResponse: (r: LoginResponse) => {
        const next = applyAccessToken(r.token);
        set((s) => ({ ...s, ...next, userName: r.nome }));
      },

      setUserProfile: (nome) => set({ userName: nome }),

      logout: () =>
        set({
          accessToken: null,
          expiresAt: null,
          userEmail: null,
          userName: null,
          roles: [],
        }),

      isGestor: () => get().roles.includes('ROLE_GESTOR'),
      isColaborador: () => get().roles.includes('ROLE_COLABORADOR'),

      isSessionValid: () => {
        const { accessToken, expiresAt } = get();
        if (!accessToken || !expiresAt) return false;
        return Date.now() < expiresAt;
      },

      secondsUntilExpiry: () => {
        const { expiresAt } = get();
        if (!expiresAt) return 0;
        return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        accessToken: s.accessToken,
        expiresAt: s.expiresAt,
        userEmail: s.userEmail,
        userName: s.userName,
        roles: s.roles,
      }),
    }
  )
);