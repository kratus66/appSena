import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AprendicesService } from './aprendices.service';
import { Aprendiz } from './entities/aprendiz.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('AprendicesService', () => {
  let service: AprendicesService;
  let aprendizRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let fichaRepository: { findOne: jest.Mock };
  let userRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  const buildUser = (overrides: Partial<User> = {}): User => ({ ...overrides }) as User;

  const buildAprendiz = (overrides: Partial<Aprendiz> = {}): Aprendiz =>
    ({
      id: 'aprendiz-1',
      documento: '123456',
      ficha: { id: 'ficha-1', instructorId: 'instructor-A', colegioId: 'colegio-A' },
      ...overrides,
    }) as Aprendiz;

  beforeEach(async () => {
    aprendizRepository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    fichaRepository = { findOne: jest.fn() };
    userRepository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

    // El EntityManager de la transacción resuelve el repo según la entidad pedida.
    const managerMock = {
      getRepository: jest.fn((entity: unknown) =>
        entity === User ? userRepository : aprendizRepository,
      ),
    };
    dataSource = {
      transaction: jest.fn((cb: (m: unknown) => unknown) => cb(managerMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AprendicesService,
        { provide: getRepositoryToken(Aprendiz), useValue: aprendizRepository },
        { provide: getRepositoryToken(Ficha), useValue: fichaRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<AprendicesService>(AprendicesService);
  });

  describe('findOne — aislamiento por autorización (regresión SEC-2)', () => {
    it('un INSTRUCTOR puede ver un aprendiz de su propia ficha', async () => {
      const aprendiz = buildAprendiz();
      aprendizRepository.findOne.mockResolvedValue(aprendiz);
      const instructor = buildUser({ id: 'instructor-A', rol: UserRole.INSTRUCTOR });

      await expect(service.findOne(aprendiz.id, instructor)).resolves.toBe(aprendiz);
    });

    it('un INSTRUCTOR NO puede ver un aprendiz de la ficha de otro instructor', async () => {
      const aprendiz = buildAprendiz();
      aprendizRepository.findOne.mockResolvedValue(aprendiz);
      const otroInstructor = buildUser({ id: 'instructor-B', rol: UserRole.INSTRUCTOR });

      await expect(service.findOne(aprendiz.id, otroInstructor)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('un COORDINADOR de otro colegio NO puede ver el aprendiz (IDOR)', async () => {
      const aprendiz = buildAprendiz();
      aprendizRepository.findOne.mockResolvedValue(aprendiz);
      const coordinador = buildUser({
        id: 'coord-1',
        rol: UserRole.COORDINADOR,
        colegioId: 'colegio-B',
      });

      await expect(service.findOne(aprendiz.id, coordinador)).rejects.toThrow(ForbiddenException);
    });

    it('lanza NotFoundException si el aprendiz no existe', async () => {
      aprendizRepository.findOne.mockResolvedValue(null);
      const admin = buildUser({ id: 'admin-1', rol: UserRole.ADMIN });

      await expect(service.findOne('no-existe', admin)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = { documento: '999', fichaId: 'ficha-1' } as any;

    it('crea usuario (rol aprendiz) y aprendiz en una transacción cuando el instructor tiene acceso', async () => {
      aprendizRepository.findOne.mockResolvedValue(null); // sin duplicados
      fichaRepository.findOne.mockResolvedValue({
        id: 'ficha-1',
        instructorId: 'instructor-A',
      });
      userRepository.findOne.mockResolvedValue(null); // no hay usuario con ese documento
      userRepository.create.mockImplementation((data) => data);
      userRepository.save.mockResolvedValue({ id: 'user-nuevo', rol: UserRole.APRENDIZ });
      const creado = buildAprendiz({ documento: dto.documento });
      aprendizRepository.create.mockReturnValue(creado);
      aprendizRepository.save.mockResolvedValue(creado);
      const instructor = buildUser({ id: 'instructor-A', rol: UserRole.INSTRUCTOR });

      const result = await service.create(dto, instructor);

      expect(result).toBe(creado);
      expect(dataSource.transaction).toHaveBeenCalled();
      // El usuario espejo se crea con rol aprendiz y el aprendiz queda vinculado a él
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ rol: UserRole.APRENDIZ }),
      );
      expect(aprendizRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-nuevo' }),
      );
    });

    it('reutiliza el usuario existente cuando ya hay uno con el mismo documento', async () => {
      aprendizRepository.findOne.mockResolvedValue(null);
      fichaRepository.findOne.mockResolvedValue({ id: 'ficha-1', instructorId: 'instructor-A' });
      userRepository.findOne.mockResolvedValue({ id: 'user-existente' });
      const creado = buildAprendiz({ documento: dto.documento });
      aprendizRepository.create.mockReturnValue(creado);
      aprendizRepository.save.mockResolvedValue(creado);
      const instructor = buildUser({ id: 'instructor-A', rol: UserRole.INSTRUCTOR });

      await service.create(dto, instructor);

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(aprendizRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-existente' }),
      );
    });

    it('rechaza si el instructor intenta crear un aprendiz en la ficha de otro', async () => {
      aprendizRepository.findOne.mockResolvedValue(null);
      fichaRepository.findOne.mockResolvedValue({
        id: 'ficha-1',
        instructorId: 'instructor-A',
      });
      const otroInstructor = buildUser({ id: 'instructor-B', rol: UserRole.INSTRUCTOR });

      await expect(service.create(dto, otroInstructor)).rejects.toThrow(ForbiddenException);
      expect(aprendizRepository.save).not.toHaveBeenCalled();
    });

    it('rechaza si el documento ya está registrado', async () => {
      aprendizRepository.findOne.mockResolvedValue(buildAprendiz());
      const admin = buildUser({ id: 'admin-1', rol: UserRole.ADMIN });

      await expect(service.create(dto, admin)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateEstado — aislamiento por colegio (regresión C3)', () => {
    const estadoDto = { estadoAcademico: 'RETIRADO' } as any;

    it('un COORDINADOR de otro colegio NO puede cambiar el estado del aprendiz', async () => {
      aprendizRepository.findOne.mockResolvedValue(buildAprendiz());
      const coordinador = buildUser({
        id: 'coord-1',
        rol: UserRole.COORDINADOR,
        colegioId: 'colegio-B',
      });

      await expect(service.updateEstado('aprendiz-1', estadoDto, coordinador)).rejects.toThrow(
        ForbiddenException,
      );
      expect(aprendizRepository.save).not.toHaveBeenCalled();
    });

    it('un COORDINADOR de su mismo colegio sí puede cambiar el estado', async () => {
      const aprendiz = buildAprendiz();
      aprendizRepository.findOne.mockResolvedValue(aprendiz);
      aprendizRepository.save.mockResolvedValue(aprendiz);
      const coordinador = buildUser({
        id: 'coord-1',
        rol: UserRole.COORDINADOR,
        colegioId: 'colegio-A',
      });

      await expect(service.updateEstado('aprendiz-1', estadoDto, coordinador)).resolves.toBe(
        aprendiz,
      );
      expect(aprendizRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('solo ADMIN puede eliminar', async () => {
      const instructor = buildUser({ id: 'instructor-A', rol: UserRole.INSTRUCTOR });

      await expect(service.remove('aprendiz-1', instructor)).rejects.toThrow(ForbiddenException);
    });
  });
});
