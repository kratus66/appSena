# Plan de sprints — Camino a vendible

> Ejecuta, en orden, los ítems de [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md). Los IDs (`SEC-x`, `FE-x`, `QA-x`, `OPS-x`, `BIZ-x`) son los mismos en ambos documentos — al cerrar un ítem, actualizá su estado allá y movelo al historial.
>
> Estimaciones asumiendo **1 desarrollador full-stack dedicado** a tiempo completo. Si hay más gente, los sprints 2 y 3 se pueden paralelizar entre backend y frontend porque no comparten archivos.
>
> No arrancar un sprint sin haber cerrado el anterior — el orden está diseñado así a propósito: primero se cierra la puerta (nadie no autenticado toca datos), después se endurece la cerradura (sesión, límites), después se pone alarma (tests, CI), y al final se pinta la fachada (pulido).

---

## Sprint 1 — Cerrar la puerta abierta ✅ CERRADO (2026-07-09)
**Duración estimada:** 4-6 días · **Objetivo:** que nadie sin sesión pueda leer o modificar datos, que el frontend tenga un build de producción real, y que el próximo cambio de esquema quede versionado (no manual).

> Los 5 ítems de este sprint están implementados y verificados en vivo contra el contenedor de desarrollo: build de backend y frontend limpios, `docker restart` + smoke test de auth (401 sin token, 200 con token), y prueba directa de IDOR (coordinador de un colegio recibe 403 al pedir por ID una ficha de otro colegio). Detalle de verificación en el historial de [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md).

Este sprint es el único 100% bloqueante. Nada de esto se negocia ni se pospone.

| Orden | ID | Tarea | Por qué en este orden |
|---|---|---|---|
| 1 | `OPS-1` | Crear `DataSource` explícito de TypeORM + carpeta `migrations/` con una migración inicial generada del esquema actual. | Hace falta *antes* de `SEC-2`, para que el cambio de esquema de esa tarea (agregar `colegioId` a `User`) quede como una migración versionada y no como un `synchronize` manual. |
| 2 | `SEC-3` | `JWT_SECRET` obligatorio: la app falla al arrancar si falta o es débil. Quitar el fallback `'your-secret-key'` de `jwt.strategy.ts` y `auth.module.ts`. | Aislado, sin dependencias, 30 minutos de trabajo real — se hace ya para no olvidarlo. |
| 3 | `SEC-1` | Reactivar `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()` en `fichas`, `colegios`, `programas`, `users`, replicando el patrón de `asistencias.controller.ts`. | Aislado por controlador, no depende de nada. Es el hallazgo más grave del informe. |
| 4 | `SEC-2` | Agregar `colegioId` a `User`; filtrar por colegio en fichas, aprendices, asistencias, disciplinario, ptc, agenda, reportes para todos los roles (hoy solo `INSTRUCTOR` está acotado). | El más grande del sprint — tocá servicio por servicio, no todo junto en un commit. Usa la infraestructura de migraciones de la tarea 1. |
| 5 | `FE-1` | Envolver el `useSearchParams()` de `nueva-sesion/page.tsx` en `<Suspense>`; correr `npm run build` hasta que salga en 0. | Independiente del resto, en paralelo si hay alguien de frontend disponible. |

**Definition of Done del sprint:**
- `curl` sin header `Authorization` a `GET /api/fichas`, `GET /api/users`, `DELETE /api/colegios/:id` responde `401`.
- Un usuario `COORDINADOR` del colegio A recibe `403`/`404` al pedir por ID una ficha del colegio B (probado a mano, no hace falta test automatizado todavía — eso es Sprint 3).
- `npm run build` en `frontend/` termina en 0 sin bypass de prerender.
- Existe al menos 1 archivo de migración en `backend/src/migrations/` (o donde se configure) y `migration:run` funciona contra una base limpia.

---

## Sprint 2 — Endurecer la sesión y el borde de la API ✅ CERRADO (2026-07-10)
**Duración estimada:** 4-5 días · **Objetivo:** que un XSS o una fuga de URL no equivalgan a robo de cuenta o de evidencias, y que la API no leak errores internos ni sea trivial de fuerza-brutear.

> Verificado en vivo: cookie httpOnly confirmada con `curl -i` (sin token expuesto a JS), acceso autenticado solo con cookie (sin header `Authorization`), ruta vieja de `/uploads/` devuelve 404, endpoint nuevo `/api/uploads/...` exige sesión, 6 intentos de login seguidos disparan `429` en el sexto, y un error de base de datos forzado (UUID inválido) llega al cliente como mensaje genérico mientras el stack real queda solo en el log del servidor. Detalle completo en el historial de [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md).

| Orden | ID | Tarea |
|---|---|---|
| 1 | `SEC-5` | Backend: setear el JWT como cookie httpOnly + `Secure` + `SameSite` en `/auth/login`. Frontend: dejar de leer/escribir el token con `localStorage`; agregar `middleware.ts` que redirige a `/login` si no hay cookie de sesión antes de renderizar `/dashboard/*`. |
| 2 | `SEC-4` | Proteger `/uploads/`: guard que valida JWT antes de servir el archivo, o migrar a URLs firmadas de S3 con expiración (`@aws-sdk/s3-request-presigner` ya está instalado). |
| 3 | `SEC-6` | Instalar `helmet` y `@nestjs/throttler`. `helmet()` global en `main.ts`. Límite de intentos en `POST /api/auth/login` (~5/min/IP) y un límite global razonable para el resto de la API. |
| 4 | `OPS-2` | `AllExceptionsFilter` global: normaliza la respuesta de error hacia el cliente y loguea el detalle real solo del lado servidor. |

**Definition of Done del sprint:**
- Inspeccionando el storage del navegador tras login, no hay ningún token en `localStorage`/`sessionStorage`.
- Navegar directo a una URL de `/dashboard/*` sin sesión redirige a `/login` sin flash de contenido protegido.
- Una URL de `/uploads/...` copiada y abierta en una ventana sin sesión no descarga el archivo.
- 6 intentos de login fallidos seguidos desde la misma IP devuelven `429` en el sexto.
- Forzar un error de constraint de Postgres (ej. UUID inválido) no expone el mensaje crudo de TypeORM al cliente.

---

## Sprint 3 — Confiabilidad y CI real ✅ CERRADO (2026-07-10)
**Duración estimada:** 5-7 días · **Objetivo:** que el pipeline verde signifique algo, y que una regresión de auth/roles se detecte antes de llegar a producción.

> Hallazgo no previsto: el workflow de CI vivía en `backend/.github/workflows/` y por eso **nunca se había ejecutado en GitHub** — la raíz real del repo es `appSena/`, y GitHub Actions solo lee `.github/workflows/` en la raíz. Se movió y se agregaron jobs de frontend que no existían. Detalle completo, incluida la prueba de que el test de regresión de guards realmente falla si se reintroduce el bug, en el historial de [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md).

| Orden | ID | Tarea |
|---|---|---|
| 1 | `QA-4` | Limpiar los 42 errores de lint (mayoría imports sin usar, varios son restos exactos de los guards que se reactivaron en Sprint 1). |
| 2 | `QA-1` | Tests de backend: `auth.service` (login válido/inválido/usuario inactivo), `RolesGuard` (rol correcto/incorrecto), y por cada módulo de negocio crítico (fichas, aprendices, asistencias, disciplinario) el caso feliz + el rechazo por autorización — estos últimos son literalmente los casos de `SEC-1`/`SEC-2`, ya conocés el comportamiento esperado. |
| 3 | `QA-2` | Frontend: configurar un runner (Vitest o Jest + Testing Library) y cubrir el flujo de login, el redirect de `middleware.ts` sin sesión, y que `sidebar.tsx` muestre el nav correcto por rol. |
| 4 | `QA-3` | Ajustar `backend/.github/workflows/ci-cd.yml` si hace falta (env vars, versión de node) hasta que un push real a `develop` termine en verde. |

**Definition of Done del sprint:**
- `npm run lint` sale en 0 errores.
- `npm run test:cov` corre suites reales (no "no tests found") y pasa.
- Un push a `develop` deja el pipeline de GitHub Actions en verde de punta a punta (test → build → docker).
- Hay al menos un test que falla intencionalmente si alguien vuelve a comentar los guards de `fichas.controller.ts` (regression test de `SEC-1`).

---

## Sprint 4 — Pulido y cierre de venta ✅ CERRADO (2026-07-11, BIZ-1 con nota legal pendiente)
**Duración estimada:** 3-5 días · **Objetivo:** rematar los ítems que no bloquean la venta pero sí la calidad percibida por el primer cliente institucional, y dejar cubierto el ángulo legal mínimo.

> FE-2, SEC-7, OPS-3 y OPS-4 quedaron cerrados y verificados en vivo (incluida una prueba real de robo/replay de token tras logout). BIZ-1 tiene su mitad técnica lista (`GET /api/users/me`, página `/privacidad`) pero el texto legal está explícitamente marcado como borrador — no puede cerrarse del todo sin que un abogado lo revise, tal como se documentó desde el principio. Durante el sprint también se detectó y arregló un problema no relacionado (una migración de base de datos faltante que dejó sin poder loguear al entorno de desarrollo); detalle completo en el historial de [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md).

| Orden | ID | Tarea |
|---|---|---|
| 1 | `FE-2` | Reemplazar el gráfico de "aprendices por mes" del dashboard (hoy con datos hardcodeados) por datos reales de `reportes`. Estado vacío explícito si no hay datos, nunca un mock silencioso. |
| 2 | `SEC-7` | Endpoint de logout con revocación real (denylist o refresh token con rotación) en vez de solo borrar el token del lado cliente. |
| 3 | `OPS-3` | Logging estructurado (JSON) con nivel por entorno; evaluar Sentry (o equivalente) para excepciones no controladas en producción. |
| 4 | `OPS-4` | Comentario explícito en `docker-compose.yml` dejando claro que es solo para desarrollo local. |
| 5 | `BIZ-1` | Con acompañamiento legal: publicar política de tratamiento de datos personales y aviso de privacidad en el frontend. Ingeniería aporta el mecanismo técnico de acceso/rectificación/eliminación de datos (se apoya en el soft delete ya existente en `BaseEntity`). |

**Definition of Done del sprint:**
- El dashboard no muestra ningún número inventado.
- Logout invalida el token de forma verificable (un token "deslogueado" reusado responde 401).
- Hay política de privacidad visible en el frontend antes de la primera venta institucional.

---

## Resumen de duración

| Sprint | Foco | Días estimados (1 dev) |
|---|---|---|
| 1 | Bloqueantes (auth, multi-tenant, build, migraciones) | 4-6 |
| 2 | Sesión y borde de API | 4-5 |
| 3 | Testing y CI real | 5-7 |
| 4 | Pulido y cumplimiento | 3-5 |
| **Total** | | **16-23 días hábiles** (~3-4.5 semanas) |

El producto es **vendible en un sentido mínimo responsable al cerrar el Sprint 1** (nadie externo puede tocar datos ajenos y el frontend compila). Sprints 2-4 son lo que separa "funciona" de "se lo puedo vender a una institución y dormir tranquilo".