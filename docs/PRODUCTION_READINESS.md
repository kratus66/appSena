# Requisitos para ser vendible — AppSena

> Documento vivo. Nace de la auditoría técnica del 2026-07-09 (build, lint y tests ejecutados en vivo sobre `backend/` y `frontend/`, más revisión de código). Cada ítem tiene un ID estable para poder referenciarlo desde commits, PRs y el plan de sprints ([SPRINTS.md](./SPRINTS.md)).
>
> Actualizar el estado (`Abierto` / `En progreso` / `Cerrado`) a medida que se resuelva cada ítem. No borrar ítems cerrados — mover a la sección de historial al final.

## Cómo leer esto

- **Prioridad**: `Bloqueante` (no se vende con esto abierto) · `Importante` (se puede vender pero es alto riesgo dejarlo para después) · `Deseable` (mejora la calidad/velocidad del equipo, no bloquea la venta).
- **Evidencia**: archivo:línea donde se verificó el problema al momento de escribir este documento. Puede haberse movido — si el ítem se cierra, verificar que la evidencia ya no aplica antes de marcarlo `Cerrado`.

## Resumen ejecutivo

Estado actual: **no vendible**. Hay 4 ítems bloqueantes — todos de alcance acotado y resolubles en un sprint corto — más una lista de endurecimiento que reduce el riesgo de vender un producto que un cliente real pueda romper u operar con datos de otro cliente.

| Categoría | Bloqueante | Importante | Deseable |
|---|---|---|---|
| Seguridad (SEC) | 3 | 3 | 1 |
| Frontend / Build (FE) | 1 | 0 | 1 |
| Calidad / Testing (QA) | 0 | 3 | 1 |
| Operación (OPS) | 0 | 1 | 3 |
| Negocio / Cumplimiento (BIZ) | 0 | 1 | 0 |

---

## Seguridad (SEC)

### SEC-1 — Reactivar autorización en fichas, colegios, programas y usuarios
**Prioridad:** Bloqueante · **Estado:** Cerrado (2026-07-09)

Los controladores de `fichas`, `colegios`, `programas` y `users` no exigen token ni rol. Cualquiera en internet puede crear, leer, editar o borrar fichas, colegios, programas de formación y **cuentas de usuario** (incluida la creación de un admin) sin autenticarse.

- **Evidencia:** `backend/src/fichas/fichas.controller.ts:41` (guards y `@Roles()` comentados con "COMENTADO PARA PRUEBAS"), `backend/src/colegios/colegios.controller.ts`, `backend/src/programas/programas.controller.ts`, `backend/src/users/users.controller.ts` — ninguno importa `JwtAuthGuard`/`RolesGuard`.
- **Criterio de aceptación:** los cuatro controladores aplican `@UseGuards(JwtAuthGuard, RolesGuard)` a nivel de clase y `@Roles(...)` por endpoint, replicando el patrón ya usado correctamente en los otros 13 módulos (p. ej. `asistencias.controller.ts`). Un request sin `Authorization: Bearer` a cualquiera de estas rutas responde `401`. Un rol sin permiso responde `403`.
- **Cómo verificar:** request sin token a `GET /api/fichas`, `GET /api/users`, `DELETE /api/colegios/:id` → deben responder 401.

### SEC-2 — Aislamiento por colegio (multi-tenant) para cerrar el IDOR
**Prioridad:** Bloqueante · **Estado:** Cerrado (2026-07-09)

Solo el rol `INSTRUCTOR` está acotado a sus propias fichas. `ADMIN` y `COORDINADOR` no tienen ningún filtro por colegio — no existe siquiera la relación usuario↔colegio en el modelo de datos — así que cualquier cuenta con esos roles puede leer o modificar datos de un colegio distinto al suyo con solo adivinar/enumerar el UUID.

- **Evidencia:** `backend/src/aprendices/aprendices.service.ts:124-140` (scoping solo para `UserRole.INSTRUCTOR`), `backend/src/fichas/fichas.service.ts:191-202` (`findOne(id)` sin scoping alguno).
- **Criterio de aceptación:** el `User` tiene un `colegioId` (o relación equivalente); todos los servicios que devuelven o mutan fichas, aprendices, asistencias, disciplinario, ptc, agenda y reportes filtran por el colegio del usuario autenticado salvo para un rol explícito de super-admin de plataforma. Un usuario de un colegio recibe 403/404 al pedir por ID un recurso de otro colegio.
- **Nota de alcance:** este es el ítem de mayor impacto en el modelo de datos — probablemente requiere una migración de esquema. Planificarlo primero en el sprint que lo contenga.

### SEC-3 — Eliminar el secreto JWT por defecto
**Prioridad:** Bloqueante · **Estado:** Cerrado (2026-07-09)

Si la variable `JWT_SECRET` falta o se pierde en el entorno de producción, la aplicación arranca igual y firma/valida tokens con la cadena literal `'your-secret-key'`, conocida por cualquiera que lea el código fuente (es un repo, potencialmente accesible a compradores/auditores técnicos).

- **Evidencia:** `backend/src/auth/strategies/jwt.strategy.ts:17`, `backend/src/auth/auth.module.ts:18`.
- **Criterio de aceptación:** la app falla al arrancar (`throw` en el `useFactory` o validación de config al boot) si `JWT_SECRET` no está definido o tiene menos de, por ejemplo, 32 caracteres. Sin fallback hardcodeado en ningún punto del código.

### SEC-4 — Proteger los archivos subidos (`/uploads/`)
**Prioridad:** Importante · **Estado:** Cerrado (2026-07-10)

El endpoint de subida exige JWT, pero una vez subido el archivo queda servido como estático público en `/uploads/`. Cualquiera con la URL (filtrada, adivinada o compartida sin querer) descarga evidencias sin autenticarse.

- **Evidencia:** `backend/src/main.ts:35-37`.
- **Criterio de aceptación:** opción A (rápida) — servir `/uploads/` detrás de un guard que valide el JWT antes de hacer streaming del archivo. Opción B (recomendada a mediano plazo) — mover a URLs firmadas de S3 con expiración corta, ya que `@aws-sdk/s3-request-presigner` ya está en las dependencias.

### SEC-5 — Sesión del frontend: token fuera de `localStorage` + protección de rutas en servidor
**Prioridad:** Importante · **Estado:** Cerrado (2026-07-10)

El JWT se guarda en `localStorage` (no en cookie httpOnly), y no existe `middleware.ts`: la protección de rutas depende únicamente de que el interceptor de axios reaccione a un 401 después de que la página y la navegación ya se renderizaron.

- **Evidencia:** `frontend/app/login/page.tsx:29,36`, `frontend/lib/api.ts:15`, ausencia de `frontend/middleware.ts`.
- **Criterio de aceptación:** el backend setea el JWT como cookie httpOnly + `Secure` + `SameSite=Lax/Strict` en el login; el frontend deja de leer el token con JS. Se agrega `middleware.ts` que redirige a `/login` antes de renderizar cualquier ruta bajo `/dashboard` si no hay sesión válida.

### SEC-6 — Rate limiting y cabeceras de seguridad
**Prioridad:** Importante · **Estado:** Cerrado (2026-07-10)

No hay `helmet` ni `@nestjs/throttler` instalados. El login no tiene límite de intentos — fuerza bruta de contraseñas es viable hoy sin ninguna fricción.

- **Evidencia:** ausencia de `helmet`/`throttler` en `backend/package.json` y `node_modules`.
- **Criterio de aceptación:** `helmet()` aplicado globalmente en `main.ts`; `ThrottlerModule` limitando `POST /api/auth/login` (p. ej. 5 intentos / minuto / IP) y, como mínimo, un límite global razonable para el resto de la API.

### SEC-7 — Revocación de sesión (logout real)
**Prioridad:** Deseable · **Estado:** Cerrado (2026-07-11)

No existe logout, refresh token ni lista de revocación. Un token robado sigue siendo válido hasta su expiración (24h por defecto) aunque se desactive la cuenta para nuevas peticiones normales.

- **Evidencia:** `backend/src/auth/auth.module.ts:20`, `backend/src/auth/auth.service.ts:57`.
- **Criterio de aceptación:** endpoint de logout que invalida el token actual (denylist en Redis/DB, o reducir TTL + refresh token con rotación). No bloquea la venta, pero sí una auditoría de seguridad de un cliente institucional.

---

## Frontend / Build (FE)

### FE-1 — El build de producción del frontend falla
**Prioridad:** Bloqueante · **Estado:** Cerrado (2026-07-09)

`npm run build` fue ejecutado y falla en la etapa de generación estática: `useSearchParams()` sin `<Suspense>` rompe el prerender de una página. **Hoy no existe un artefacto de producción desplegable del frontend.**

- **Evidencia:** `frontend/app/dashboard/asistencias/nueva-sesion/page.tsx:4,15`. Error verbatim: `useSearchParams() should be wrapped in a suspense boundary`.
- **Criterio de aceptación:** `npm run build` termina en 0 sin errores ni el flag de bypass de prerender. Envolver el componente que usa `useSearchParams()` en un `<Suspense fallback=...>`.

### FE-2 — Quitar datos de ejemplo (mock) del dashboard
**Prioridad:** Deseable · **Estado:** Cerrado (2026-07-11)

El gráfico "aprendices por mes" del dashboard usa datos hardcodeados, no la API — un cliente real vería una métrica falsa presentada como real.

- **Evidencia:** `frontend/app/dashboard/page.tsx:112-119`.
- **Criterio de aceptación:** el gráfico consume un endpoint real de `reportes`/`métricas`; si el dato no está disponible, se muestra un estado vacío explícito en vez de datos inventados.

---

## Calidad / Testing (QA)

### QA-1 — Suite de pruebas backend para los flujos que importan
**Prioridad:** Importante · **Estado:** Cerrado (2026-07-10)

0 archivos `*.spec.ts` en todo `backend/src`. Nada impide que un cambio futuro rompa login, roles o asistencias sin que nadie lo note antes de producción.

- **Criterio de aceptación (mínimo viable, no cobertura total):** tests de `auth.service` (login válido/inválido, usuario inactivo), `RolesGuard` (rol correcto/incorrecto), y de al menos un servicio por módulo de negocio crítico (fichas, asistencias, disciplinario) cubriendo el caso feliz y el rechazo por autorización (relacionado con SEC-1/SEC-2 — son los mismos casos que hay que probar para no regresar a este estado).

### QA-2 — Pruebas de frontend para auth y navegación por rol
**Prioridad:** Importante · **Estado:** Cerrado (2026-07-10)

0 archivos `*.test.tsx`/`*.spec.tsx`, sin runner configurado (ni jest ni vitest ni playwright).

- **Criterio de aceptación:** al menos un test de integración que confirme que un usuario sin sesión es redirigido desde `/dashboard/*`, y que la navegación (`sidebar.tsx`) muestra el set correcto de ítems por rol.

### QA-3 — CI/CD verde de verdad
**Prioridad:** Importante · **Estado:** Cerrado (2026-07-10)

El pipeline en `backend/.github/workflows/ci-cd.yml` corre `npm run lint` y `npm run test:cov` en cada push a `main`/`develop`. Con el estado actual del código **ambos pasos fallan** (42 errores de lint, "no tests found" con exit code 1) — el pipeline no es una señal confiable hoy.

- **Evidencia:** ejecución directa de `npm run lint` (42 errores) y `npx jest` ("No tests found, exiting with code 1").
- **Criterio de aceptación:** un push a `develop` termina el pipeline en verde. Depende de QA-1 (para que `test:cov` tenga algo que correr) y de QA-4 (para que `lint` pase).

### QA-4 — Limpieza de lint
**Prioridad:** Deseable · **Estado:** Cerrado (2026-07-10)

- **Criterio de aceptación:** `npm run lint` sale en 0 errores.

---

## Operación (OPS)

### OPS-1 — Estrategia de migraciones de esquema para producción
**Prioridad:** Importante · **Estado:** Cerrado (2026-07-09)

`synchronize` está correctamente desactivado fuera de `development` (`backend/src/app.module.ts:61`), lo cual es correcto — pero no existe ningún `data-source` de TypeORM ni carpeta `migrations/`, así que los scripts `migration:generate`/`migration:run` de `package.json` no tienen dónde apuntar. Hoy, un cambio de esquema en producción no tiene un camino definido y seguro.

- **Evidencia:** ausencia de `data-source.ts`/`typeorm.config.ts` y de una carpeta `migrations/` en `backend/src`.
- **Criterio de aceptación:** existe un `DataSource` explícito reusado tanto por la app como por la CLI de TypeORM; al menos una migración inicial generada a partir del esquema actual; el proceso de deploy documentado en `docs/DEPLOY_LIGHTSAIL_RDS.md` incluye el paso `migration:run` antes de levantar la nueva versión.

### OPS-2 — Filtro global de excepciones
**Prioridad:** Deseable · **Estado:** Cerrado (2026-07-10)

No hay `ExceptionFilter` global — errores de TypeORM/Postgres no manejados explícitamente pueden llegar sin transformar al cliente (mensajes internos, nombres de columnas, etc.).

- **Criterio de aceptación:** un `AllExceptionsFilter` global normaliza la respuesta de error (código, mensaje seguro para el usuario) y loguea el detalle real del lado servidor.

### OPS-3 — Logging estructurado
**Prioridad:** Deseable · **Estado:** Cerrado (2026-07-11)

Solo `console.log`/`Logger` puntual, sin logging de requests ni integración con un servicio de errores (Sentry o similar).

- **Criterio de aceptación:** logger estructurado (JSON) con nivel configurable por entorno; opcionalmente Sentry (o equivalente) para excepciones no controladas en producción.

### OPS-4 — Endurecer `docker-compose.yml` de desarrollo
**Prioridad:** Deseable · **Estado:** Cerrado (2026-07-11)

Credenciales por defecto débiles (`postgres`/`postgres`, pgAdmin `admin`/`admin`) — aceptable solo si este compose nunca se usa como base directa de producción (el deploy real usa Lightsail/RDS según `docs/DEPLOY_LIGHTSAIL_RDS.md`, lo cual mitiga el riesgo, pero vale la pena dejar una advertencia explícita en el propio archivo).

- **Criterio de aceptación:** comentario visible en `docker-compose.yml` dejando explícito que es solo para desarrollo local y no debe reutilizarse en un VPS expuesto a internet.

---

## Negocio / Cumplimiento (BIZ)

### BIZ-1 — Tratamiento de datos personales (aprendices, muchos posiblemente menores de edad)
**Prioridad:** Importante · **Estado:** En progreso (2026-07-11) — mecanismo técnico listo, texto legal pendiente de abogado

El sistema almacena datos personales de aprendices, acudientes y procesos disciplinarios — datos sensibles, y en el caso de programas de articulación con colegios, potencialmente de menores de edad. Vender esto a instituciones educativas en Colombia probablemente implica obligaciones bajo la Ley 1581 de 2012 (protección de datos personales) y buenas prácticas de tratamiento de datos de menores.

- **Criterio de aceptación (no es tarea de ingeniería pura, requiere validación legal):** política de tratamiento de datos publicada, aviso de privacidad en el frontend, y un mecanismo técnico para atender solicitudes de acceso/rectificación/eliminación de datos personales (parcialmente ya cubierto por el soft delete existente en `BaseEntity`).

---

## Lo que ya está bien y no hay que rehacer

- `BaseEntity` con auditoría (`createdBy`/`updatedBy`/`deletedBy`) y soft delete en todas las entidades.
- `JwtAuthGuard` + `RolesGuard` + `@Roles()` correctamente aplicados en 13 de 17 controladores (asistencias, disciplinario, ptc, agenda, notificaciones, reportes, ambientes, planeacion, upload, acudientes — el patrón a replicar en SEC-1 ya existe en el propio código).
- Validación de DTOs con `class-validator` sólida en la mayoría de módulos.
- Subida a S3 con whitelist de mimetype y límite de tamaño (`upload.service.ts:63-83`).
- `synchronize` desactivado fuera de desarrollo.
- Navegación diferenciada por rol ya implementada en el frontend (`sidebar.tsx:47-73`).
- Documentación de despliegue a Lightsail/RDS con backups automáticos ya contemplados (`docs/DEPLOY_LIGHTSAIL_RDS.md`).

---

## Historial

### 2026-07-09 — Sprint 1 cerrado (OPS-1, SEC-3, SEC-1, SEC-2, FE-1)

Implementado y verificado en vivo contra el contenedor de desarrollo (`docker restart appsena-backend` + smoke tests con `curl`, no solo lectura de código):

- **OPS-1**: `backend/src/database/data-source.ts` + `backend/src/database/migrations/` con migración inicial (`InitialSchema`) generada y validada contra una base Postgres vacía efímera; scripts de `package.json` actualizados con `-d src/database/data-source.ts`; paso `migration:run` agregado a `docs/DEPLOY_LIGHTSAIL_RDS.md`.
- **SEC-3**: `backend/src/common/utils/jwt-secret.util.ts` — `getRequiredJwtSecret()` usado en `auth.module.ts` y `jwt.strategy.ts`, lanza error al boot si `JWT_SECRET` falta o tiene menos de 32 caracteres. Sin fallback hardcodeado.
- **SEC-1**: guards y `@Roles()` reactivados en `fichas.controller.ts`, `colegios.controller.ts`, `programas.controller.ts`, `users.controller.ts`. Verificado: `GET /api/fichas`, `/api/users`, `/api/colegios`, `/api/programas` responden `401` sin token.
- **SEC-2**: columna `colegio_id` en `User` (migración `AddColegioIdToUsers`) + helper `backend/src/common/utils/ficha-access.util.ts` (`canAccessFicha`/`applyFichaScope`/`isPlatformRole`) aplicado en fichas, aprendices, asistencias, disciplinario, ptc, agenda y reportes. Verificado en vivo: un `COORDINADOR` con `colegioId` asignado ve solo las fichas de su colegio (`GET /api/fichas` → 4 de 16 fichas, todas del mismo colegio) y recibe `403` al pedir por ID una ficha de otro colegio. Seeder actualizado (`seedColegioDeCoordinadores`) para asignar colegio a los coordinadores existentes.
- **FE-1**: `nueva-sesion/page.tsx` — `useSearchParams()` movido a un componente envuelto en `<Suspense>`. `npm run build` en `frontend/` termina en 0.

No incluido en este cierre (movido a QA-4 / Sprint 3): limpieza completa de lint (31 errores restantes, en su mayoría preexistentes y no relacionados con seguridad).

### 2026-07-10 — Sprint 2 cerrado (SEC-5, SEC-4, SEC-6, OPS-2)

Implementado y verificado en vivo (login real, cookies inspeccionadas con `curl -i`, backend reiniciado con las dependencias nuevas instaladas en el contenedor):

- **SEC-5**: `POST /auth/login` setea una cookie `access_token` (httpOnly, `SameSite=Lax`, `Secure` en producción, expiración igual a `JWT_EXPIRATION`) vía `backend/src/auth/auth-cookie.util.ts`; `JwtStrategy` ahora acepta la cookie o el header `Authorization: Bearer` (dual, para no romper Swagger/Postman). Nuevo `POST /auth/logout` limpia la cookie. Frontend: `lib/api.ts` con `withCredentials: true` y sin lectura/escritura de `localStorage.token`; `login/page.tsx` guarda solo el perfil (no sensible) devuelto por el backend; `middleware.ts` nuevo redirige a `/login` si falta la cookie antes de renderizar `/dashboard/*` (nota de despliegue documentada en el propio archivo: requiere que frontend y backend compartan host/dominio para que la cookie sea visible al middleware — válido en dev con `localhost` en distintos puertos, a revisar si en producción quedan en dominios totalmente distintos). De paso se corrigió que `sidebar.tsx` asumiera rol `admin` por defecto ante un `user` inválido/ausente en `localStorage` — ahora no muestra navegación hasta resolver el rol real.
- **SEC-4**: se quitó `app.useStaticAssets('/uploads')` de `main.ts`. Nuevo `GET /api/uploads/:folder/:filename` (`uploaded-files.controller.ts`) protegido con `JwtAuthGuard`, con `UploadService.resolveLocalFilePath()` validando que la ruta resuelta no se escape del directorio de uploads (path traversal). Solo aplica al modo desarrollo sin AWS configurado — en producción con S3, las URLs firmadas ya eran seguras. Verificado: `/uploads/archivo` (ruta vieja) → `404`; `/api/uploads/...` sin auth → `401`; con auth → `404`/sirve el archivo según exista.
- **SEC-6**: `helmet()` global (con `contentSecurityPolicy: false` para no romper Swagger UI) y `@nestjs/throttler` — límite global de 120 req/min y límite específico de 5 req/min en `POST /auth/login`. Verificado con 6 intentos de login seguidos: el 6to responde `429`.
- **OPS-2**: `AllExceptionsFilter` global normaliza toda respuesta de error hacia el cliente; el detalle real (stack trace, error crudo de TypeORM/Postgres) solo se loguea del lado servidor. Verificado forzando un UUID inválido en `GET /api/fichas/:id`: el cliente recibió un mensaje genérico `500`, el stack completo quedó en el log del contenedor.

Pendiente explícito para Sprint 4 (SEC-7): el logout actual solo borra la cookie del navegador — un token robado antes del logout sigue siendo válido si se reproduce con el header `Authorization` hasta su expiración natural.

### 2026-07-11 — Sprint 4 (FE-2, SEC-7, OPS-3, OPS-4, BIZ-1)

- **FE-2**: `dashboard/page.tsx` — el gráfico "Nuevos Aprendices por Mes" (antes hardcodeado y marcado "(ejemplo)") ahora se calcula agrupando por mes los `createdAt` reales de los aprendices ya cargados, con estado vacío explícito si no hay datos. También se quitaron los porcentajes de `trend` ("+12.5% vs mes anterior") de las tarjetas de Total Aprendices y Fichas Activas — eran un número fijo sin ninguna comparación real detrás; no se inventó un cálculo de tendencia para reemplazarlos, se optó por no mostrar nada antes que mostrar algo falso. La card "Actividades Recientes" se dejó igual (ya está honestamente marcada "Ejemplo" con badge; implementar un feed real de actividad es una función nueva de auditoría, no un cleanup, y queda fuera de este sprint).
- **SEC-7**: se agregó `tokenVersion` a `User` (migración `AddTokenVersionToUsers`); el JWT ahora incluye ese valor al emitirse y `AuthService.validateToken()` lo compara contra el valor vigente en base — si no coincide, el token se rechaza aunque su firma y expiración sigan siendo válidas. `POST /auth/logout` ahora requiere sesión (`JwtAuthGuard`) y llama a `revokeSession()`, que incrementa el `tokenVersion` del usuario (invalida todos sus tokens vigentes, no solo el de la cookie actual). **Verificado en vivo**: se guardó el token de un login exitoso, se cerró sesión, y ese mismo token reproducido a mano vía header `Authorization` (simulando robo) recibió `401` — antes de este cambio habría seguido funcionando hasta su expiración natural (7 días).
- **OPS-3**: se instaló `nestjs-pino` + `pino-http`. Logging estructurado JSON en producción (pretty-printed en desarrollo), nivel configurable con `LOG_LEVEL`, redacción de `Authorization`, `Cookie` y `Set-Cookie` en los logs de request (`backend/src/common/logger.config.ts`), y `/api/health` excluido del ruido de logs por request. Verificado: el header `set-cookie` aparece como `"***"` en el log tras un login real.
- **OPS-4**: comentario de advertencia agregado al inicio de `docker-compose.yml` dejando explícito que es solo para desarrollo local.
- **BIZ-1** (parcial — requiere abogado para cerrarse del todo): se agregó `GET /api/users/me` (cualquier usuario autenticado puede consultar su propio perfil — antes ni siquiera un instructor podía ver sus propios datos vía API, todo el módulo de usuarios era admin/coordinador-only). Se creó `frontend/app/privacidad/page.tsx`, enlazada desde el login, con la estructura típica exigida por la Ley 1581/Decreto 1377 de Colombia — **explícitamente marcada como borrador pendiente de revisión legal**, no lista para publicarse a clientes reales tal cual.

**Incidente durante este sprint (no relacionado con el trabajo de arriba):** a mitad de sprint se detectó que el entorno de desarrollo dejó de poder loguear (`500` en `POST /auth/login`) por un cambio en curso, en paralelo, sobre `User`/`users.service.ts` que movió los campos de perfil de instructor a una tabla nueva `perfil_instructor` (relación 1:1, `eager: true`) sin que existiera todavía la migración que crea esa tabla — cualquier consulta a `User` fallaba porque intentaba unir una tabla inexistente. Además la tabla de control `migrations` de la base de desarrollo estaba vacía (el esquema se había construido históricamente vía `synchronize`, nunca vía `migration:run`), así que correr las migraciones desde cero chocaba con objetos que ya existían. Se resolvió: (1) marcando manualmente en la tabla `migrations` las 3 migraciones cuyo esquema ya estaba aplicado vía `synchronize`, (2) generando y aplicando la migración faltante para `perfil_instructor` (reutilizando la migración de movimiento de datos ya escrita, más una migración adicional para renombrar los enums al nombre que TypeORM espera por convención), y (3) verificando con `migration:generate` que ya no queda ningún diff entre las entidades y el esquema. Verificado extremo a extremo tras el fix: login, `GET /users/me`, directorio de instructores (con el join a `perfil_instructor`) y la revocación de SEC-7 funcionando correctamente.

### 2026-07-10 — Sprint 3 cerrado (QA-4, QA-1, QA-2, QA-3)

- **QA-4**: 0 errores en `npm run lint`. La mayoría eran imports sin usar (varios, restos de guards comentados en SEC-1); se agregó `ignoreRestSiblings: true` a la regla `no-unused-vars` en `.eslintrc.js` para no seguir marcando el patrón intencional `const { password, ...result } = user`. De paso se cerró un hueco real encontrado al limpiar: `agenda.service.ts` `markReminderAsSent()` no validaba permisos sobre el evento antes de marcar un recordatorio como enviado (cualquier usuario autenticado podía marcar el recordatorio de otro) — ahora usa `validateEventPermission()` igual que `cancelReminder()`.
- **QA-1**: 7 suites / 43 tests en `backend/src/**/*.spec.ts` — `auth.service` (login válido/inválido/usuario inactivo, `validateToken`), `RolesGuard` (rol permitido/no permitido/desarrollador-siempre-pasa), y para fichas/aprendices/asistencias/disciplinario el caso feliz más el rechazo por autorización (instructor de otra ficha, coordinador de otro colegio, "fail closed" sin colegio asignado). Se agregó además `common/guards-metadata.spec.ts`, que verifica por reflection que `FichasController`/`ColegiosController`/`ProgramasController`/`UsersController` tengan `JwtAuthGuard`+`RolesGuard` a nivel de clase — **verificado que realmente detecta la regresión**: se volvió a comentar el guard de `fichas.controller.ts` a propósito, el test falló, se revirtió y volvió a pasar.
- **QA-2**: se configuró Vitest + Testing Library en `frontend/` (no existía runner de tests). 3 suites / 9 tests: `middleware.test.ts` (redirige a `/login` sin cookie de sesión, deja pasar con cookie, no interfiere fuera de `/dashboard`), `sidebar.test.tsx` (nav correcta por rol; confirma que sin `user` válido en `localStorage` ya no cae a nav de admin — regresión del fix de Sprint 2), `login/page.test.tsx` (guarda el perfil devuelto por el backend, nunca un token, y navega a `/dashboard`; muestra el error del backend sin navegar en credenciales inválidas).
- **QA-3**: se encontró que el pipeline de CI **nunca se había ejecutado en GitHub**: el workflow vivía en `backend/.github/workflows/ci-cd.yml`, pero la raíz real del repositorio git es `appSena/` (confirmado con `git rev-parse --show-toplevel` y el remoto `github.com/kratus66/appSena`) — GitHub Actions solo descubre workflows en `<raíz-del-repo>/.github/workflows/`, así que ese archivo era invisible para GitHub. Se movió a `appSena/.github/workflows/ci-cd.yml` con `working-directory: backend` en cada paso, `cache-dependency-path` corregido, `JWT_SECRET` de CI ajustado a 40+ caracteres (por el mínimo de 32 que exige SEC-3; con el valor corto anterior el job de test hubiera quedado bien porque los tests no bootean la app real, pero era inconsistente), y `context: ./backend` en el build de Docker. Se agregaron dos jobs nuevos, `frontend-test` y `frontend-build`, que antes no existían en absoluto. Verificado localmente simulando las variables de entorno exactas del job (`lint` + `test:cov` + `build` del backend, `test` + `build` del frontend con `NEXT_PUBLIC_API_URL` placeholder) y validando el YAML con `js-yaml`.