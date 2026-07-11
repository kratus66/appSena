import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'access_token';
const PROTECTED_PREFIX = '/dashboard';

/**
 * Corta el flash de contenido protegido: si no hay cookie de sesión, redirige
 * a /login antes de que el servidor renderice cualquier ruta bajo /dashboard.
 * Solo valida presencia de la cookie (la validación real del JWT ocurre en
 * cada request al backend) — es una barrera de UX/defensa en profundidad, no
 * el mecanismo de autorización.
 *
 * Nota de despliegue: esto requiere que la cookie seteada por el backend sea
 * visible para el servidor de Next.js. Funciona tal cual cuando frontend y
 * backend comparten host (p. ej. localhost en distintos puertos, o dominios
 * bajo el mismo padre). Si en producción quedan en dominios completamente
 * distintos sin relación, hay que proxyear /api a través de Next.js o
 * compartir dominio padre para que esta cookie llegue aquí.
 */
export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
