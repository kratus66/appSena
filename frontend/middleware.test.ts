import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

const AUTH_COOKIE_NAME = 'access_token';

describe('middleware — protección de rutas /dashboard (regresión SEC-5)', () => {
  it('redirige a /login si no hay cookie de sesión al entrar a /dashboard', () => {
    const request = new NextRequest(new URL('http://localhost:3001/dashboard/fichas'));

    const response = middleware(request);

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('from')).toBe('/dashboard/fichas');
  });

  it('deja pasar la petición si existe la cookie de sesión', () => {
    const request = new NextRequest(new URL('http://localhost:3001/dashboard'), {
      headers: { cookie: `${AUTH_COOKIE_NAME}=algun.jwt.valor` },
    });

    const response = middleware(request);

    // NextResponse.next() no redirige: no trae header location
    expect(response.headers.get('location')).toBeNull();
  });

  it('no interfiere con rutas fuera de /dashboard (ej. /login)', () => {
    const request = new NextRequest(new URL('http://localhost:3001/login'));

    const response = middleware(request);

    expect(response.headers.get('location')).toBeNull();
  });
});
