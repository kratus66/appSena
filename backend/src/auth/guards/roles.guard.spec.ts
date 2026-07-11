import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const buildContext = (user: { rol: UserRole } | undefined): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('permite el acceso si el endpoint no declara @Roles()', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(buildContext({ rol: UserRole.INSTRUCTOR }))).toBe(true);
  });

  it('permite el acceso si el rol del usuario está en la lista requerida', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.COORDINADOR]);

    expect(guard.canActivate(buildContext({ rol: UserRole.COORDINADOR }))).toBe(true);
  });

  it('rechaza con ForbiddenException si el rol no está permitido', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => guard.canActivate(buildContext({ rol: UserRole.INSTRUCTOR }))).toThrow(
      ForbiddenException,
    );
  });

  it('el rol DESARROLLADOR siempre pasa, aunque no esté en la lista requerida', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(buildContext({ rol: UserRole.DESARROLLADOR }))).toBe(true);
  });
});
