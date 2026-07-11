import { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'access_token';

/**
 * Convierte expresiones tipo "7d" / "24h" / "3600" (segundos) a milisegundos.
 * Cae a 24h si el formato no es reconocido, para nunca dejar la cookie sin expiración.
 */
function parseExpirationToMs(expiresIn: string | undefined): number {
  const DEFAULT_MS = 24 * 60 * 60 * 1000;
  if (!expiresIn) return DEFAULT_MS;

  const match = /^(\d+)([smhd])?$/.exec(expiresIn.trim());
  if (!match) return DEFAULT_MS;

  const value = Number(match[1]);
  const unit = match[2] ?? 's';
  const unitMs: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

  return value * (unitMs[unit] ?? 1000);
}

export function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: parseExpirationToMs(process.env.JWT_EXPIRATION),
  };
}
