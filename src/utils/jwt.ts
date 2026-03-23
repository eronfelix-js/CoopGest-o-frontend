export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Normaliza o claim `roles` como no backend (`jwt.getClaim("roles")`):
 * string com espaços, array de strings, ou vazio.
 */
export function normalizeRolesClaim(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  if (Array.isArray(value)) return value.map(String);
  return [];
}

export function extractRolesFromPayload(payload: Record<string, unknown> | null): string[] {
  if (!payload) return [];
  const authorities = payload.authorities;
  if (Array.isArray(authorities)) {
    return authorities.map(String);
  }
  const scope = payload.scope;
  if (typeof scope === 'string') {
    return scope.split(' ').filter(Boolean);
  }
  return normalizeRolesClaim(payload.roles);
}

/** Segundos até expiração do JWT (mín. 60s); fallback 24h se não houver `exp`. */
export function getExpiresInSecondsFromJwt(token: string): number {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return 86400;
  const exp = typeof payload.exp === 'number' ? payload.exp : Number(payload.exp);
  const nowSec = Math.floor(Date.now() / 1000);
  return Math.max(60, exp - nowSec);
}

export function extractSubject(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  const sub = payload.sub;
  return typeof sub === 'string' ? sub : null;
}
