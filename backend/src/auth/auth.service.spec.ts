import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    findOne: jest.Mock;
    incrementTokenVersion: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  const buildUser = (overrides: Partial<Record<string, any>> = {}) => ({
    id: 'user-1',
    email: 'admin@sena.edu.co',
    rol: UserRole.ADMIN,
    activo: true,
    nombre: 'Administrador',
    fotoPerfil: null,
    tokenVersion: 0,
    validatePassword: jest.fn().mockResolvedValue(true),
    ...overrides,
  });

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
      incrementTokenVersion: jest.fn().mockResolvedValue(undefined),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('devuelve access_token y el perfil del usuario con credenciales válidas', async () => {
      const user = buildUser();
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.login({ email: user.email, password: 'Admin123!' });

      expect(result.access_token).toBe('signed.jwt.token');
      expect(result.user).toEqual({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        fotoPerfil: user.fotoPerfil,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        rol: user.rol,
        tokenVersion: user.tokenVersion,
      });
    });

    it('rechaza cuando el email no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'nadie@sena.edu.co', password: 'x' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rechaza cuando la contraseña es incorrecta', async () => {
      const user = buildUser({ validatePassword: jest.fn().mockResolvedValue(false) });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.login({ email: user.email, password: 'incorrecta' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('rechaza usuarios inactivos aunque la contraseña sea correcta', async () => {
      const user = buildUser({ activo: false });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.login({ email: user.email, password: 'Admin123!' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('devuelve el usuario cuando existe, está activo y el tokenVersion coincide', async () => {
      const user = buildUser({ tokenVersion: 3 });
      usersService.findOne.mockResolvedValue(user);

      const result = await service.validateToken({
        sub: user.id,
        email: user.email,
        rol: user.rol,
        tokenVersion: 3,
      });

      expect(result).toBe(user);
    });

    it('rechaza si el usuario fue desactivado después de emitido el token', async () => {
      const user = buildUser({ activo: false });
      usersService.findOne.mockResolvedValue(user);

      await expect(
        service.validateToken({ sub: user.id, email: user.email, rol: user.rol, tokenVersion: 0 }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rechaza si el usuario ya no existe (borrado)', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(
        service.validateToken({
          sub: 'user-borrado',
          email: 'x@x.com',
          rol: UserRole.ADMIN,
          tokenVersion: 0,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rechaza un token emitido antes del último logout (regresión SEC-7)', async () => {
      // El usuario cerró sesión: su tokenVersion en DB ya avanzó a 1, pero este
      // token viejo todavía trae 0 — no debe seguir sirviendo aunque no haya expirado.
      const user = buildUser({ tokenVersion: 1 });
      usersService.findOne.mockResolvedValue(user);

      await expect(
        service.validateToken({ sub: user.id, email: user.email, rol: user.rol, tokenVersion: 0 }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeSession', () => {
    it('incrementa el tokenVersion del usuario para invalidar sus tokens vigentes', async () => {
      await service.revokeSession('user-1');

      expect(usersService.incrementTokenVersion).toHaveBeenCalledWith('user-1');
    });
  });
});
