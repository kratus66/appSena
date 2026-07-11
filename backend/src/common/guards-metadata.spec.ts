import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { FichasController } from '../fichas/fichas.controller';
import { ColegiosController } from '../colegios/colegios.controller';
import { ProgramasController } from '../programas/programas.controller';
import { UsersController } from '../users/users.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Regresión de SEC-1: estos 4 controladores estuvieron completamente
 * desprotegidos (guards comentados / nunca aplicados) — cualquiera sin sesión
 * podía leer y modificar fichas, colegios, programas y usuarios. Este test
 * falla si alguien vuelve a comentar o quitar `@UseGuards(JwtAuthGuard,
 * RolesGuard)` a nivel de clase en cualquiera de ellos.
 */
type Ctor = new (...args: unknown[]) => unknown;

describe('SEC-1: guards de autenticación en controladores críticos', () => {
  const controllers: [string, Ctor][] = [
    ['FichasController', FichasController],
    ['ColegiosController', ColegiosController],
    ['ProgramasController', ProgramasController],
    ['UsersController', UsersController],
  ];

  it.each(controllers)(
    '%s tiene JwtAuthGuard y RolesGuard aplicados a nivel de clase',
    (_name, controller) => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, controller) ?? [];

      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
    },
  );
});
