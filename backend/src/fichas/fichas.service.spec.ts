import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { Ficha } from './entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('FichasService', () => {
  let service: FichasService;
  let fichaRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  const buildUser = (overrides: Partial<User> = {}): User => ({ ...overrides }) as User;

  const buildFicha = (overrides: Partial<Ficha> = {}): Ficha =>
    ({
      id: 'ficha-1',
      numeroFicha: '2654321',
      instructorId: 'instructor-A',
      colegioId: 'colegio-A',
      ...overrides,
    }) as Ficha;

  beforeEach(async () => {
    fichaRepository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FichasService,
        { provide: getRepositoryToken(Ficha), useValue: fichaRepository },
        { provide: getRepositoryToken(Aprendiz), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    service = module.get<FichasService>(FichasService);
  });

  describe('findOne — aislamiento por autorización (regresión SEC-1/SEC-2)', () => {
    it('un ADMIN puede ver cualquier ficha', async () => {
      const ficha = buildFicha();
      fichaRepository.findOne.mockResolvedValue(ficha);
      const admin = buildUser({ id: 'admin-1', rol: UserRole.ADMIN });

      await expect(service.findOne(ficha.id, admin)).resolves.toBe(ficha);
    });

    it('un INSTRUCTOR puede ver una ficha propia', async () => {
      const ficha = buildFicha({ instructorId: 'instructor-A' });
      fichaRepository.findOne.mockResolvedValue(ficha);
      const instructor = buildUser({ id: 'instructor-A', rol: UserRole.INSTRUCTOR });

      await expect(service.findOne(ficha.id, instructor)).resolves.toBe(ficha);
    });

    it('un INSTRUCTOR NO puede ver una ficha de otro instructor', async () => {
      const ficha = buildFicha({ instructorId: 'instructor-A' });
      fichaRepository.findOne.mockResolvedValue(ficha);
      const otroInstructor = buildUser({ id: 'instructor-B', rol: UserRole.INSTRUCTOR });

      await expect(service.findOne(ficha.id, otroInstructor)).rejects.toThrow(ForbiddenException);
    });

    it('un COORDINADOR puede ver una ficha de su propio colegio', async () => {
      const ficha = buildFicha({ colegioId: 'colegio-A' });
      fichaRepository.findOne.mockResolvedValue(ficha);
      const coordinador = buildUser({
        id: 'coord-1',
        rol: UserRole.COORDINADOR,
        colegioId: 'colegio-A',
      });

      await expect(service.findOne(ficha.id, coordinador)).resolves.toBe(ficha);
    });

    it('un COORDINADOR NO puede ver una ficha de otro colegio (IDOR)', async () => {
      const ficha = buildFicha({ colegioId: 'colegio-A' });
      fichaRepository.findOne.mockResolvedValue(ficha);
      const coordinador = buildUser({
        id: 'coord-1',
        rol: UserRole.COORDINADOR,
        colegioId: 'colegio-B',
      });

      await expect(service.findOne(ficha.id, coordinador)).rejects.toThrow(ForbiddenException);
    });

    it('un COORDINADOR sin colegio asignado no ve ninguna ficha (fail closed)', async () => {
      const ficha = buildFicha({ colegioId: 'colegio-A' });
      fichaRepository.findOne.mockResolvedValue(ficha);
      const coordinador = buildUser({
        id: 'coord-1',
        rol: UserRole.COORDINADOR,
        colegioId: null,
      });

      await expect(service.findOne(ficha.id, coordinador)).rejects.toThrow(ForbiddenException);
    });

    it('lanza NotFoundException si la ficha no existe', async () => {
      fichaRepository.findOne.mockResolvedValue(null);
      const admin = buildUser({ id: 'admin-1', rol: UserRole.ADMIN });

      await expect(service.findOne('no-existe', admin)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('crea la ficha cuando el número no está duplicado', async () => {
      fichaRepository.findOne.mockResolvedValue(null);
      const dto = { numeroFicha: '9999999' } as any;
      const created = buildFicha({ numeroFicha: dto.numeroFicha });
      fichaRepository.create.mockReturnValue(created);
      fichaRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toBe(created);
      expect(fichaRepository.save).toHaveBeenCalledWith(created);
    });

    it('rechaza si ya existe una ficha con el mismo número', async () => {
      fichaRepository.findOne.mockResolvedValue(buildFicha());

      await expect(service.create({ numeroFicha: '2654321' } as any)).rejects.toThrow(
        ConflictException,
      );
      expect(fichaRepository.save).not.toHaveBeenCalled();
    });
  });
});
