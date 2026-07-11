import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { ClaseSesion } from './entities/clase-sesion.entity';
import { Asistencia } from './entities/asistencia.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('AsistenciasService', () => {
  let service: AsistenciasService;
  let sesionRepository: { findOne: jest.Mock };
  let asistenciaRepository: { findOne: jest.Mock; save: jest.Mock };
  let aprendizRepository: { find: jest.Mock };

  const buildUser = (overrides: Partial<User> = {}): User => ({ ...overrides }) as User;

  const buildSesion = (overrides: Partial<ClaseSesion> = {}): ClaseSesion =>
    ({
      id: 'sesion-1',
      fichaId: 'ficha-1',
      ficha: { id: 'ficha-1', instructorId: 'instructor-A', colegioId: 'colegio-A' },
      asistencias: [],
      ...overrides,
    }) as unknown as ClaseSesion;

  beforeEach(async () => {
    sesionRepository = { findOne: jest.fn() };
    asistenciaRepository = { findOne: jest.fn(), save: jest.fn() };
    aprendizRepository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsistenciasService,
        { provide: getRepositoryToken(ClaseSesion), useValue: sesionRepository },
        { provide: getRepositoryToken(Asistencia), useValue: asistenciaRepository },
        { provide: getRepositoryToken(Ficha), useValue: {} },
        { provide: getRepositoryToken(Aprendiz), useValue: aprendizRepository },
      ],
    }).compile();

    service = module.get<AsistenciasService>(AsistenciasService);
  });

  describe('findOneSesion — aislamiento por autorización (regresión SEC-2)', () => {
    it('un INSTRUCTOR puede ver el detalle de una sesión de su ficha', async () => {
      const sesion = buildSesion();
      sesionRepository.findOne.mockResolvedValue(sesion);
      const instructor = buildUser({ id: 'instructor-A', rol: UserRole.INSTRUCTOR });

      const result = (await service.findOneSesion(sesion.id, instructor)) as any;

      expect(result.id).toBe(sesion.id);
      expect(result.resumen).toEqual({
        totalAprendices: 0,
        presentes: 0,
        ausentes: 0,
        justificadas: 0,
      });
    });

    it('un INSTRUCTOR NO puede ver la sesión de la ficha de otro instructor', async () => {
      const sesion = buildSesion();
      sesionRepository.findOne.mockResolvedValue(sesion);
      const otroInstructor = buildUser({ id: 'instructor-B', rol: UserRole.INSTRUCTOR });

      await expect(service.findOneSesion(sesion.id, otroInstructor)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('un COORDINADOR de otro colegio NO puede ver la sesión (IDOR)', async () => {
      const sesion = buildSesion();
      sesionRepository.findOne.mockResolvedValue(sesion);
      const coordinador = buildUser({
        id: 'coord-1',
        rol: UserRole.COORDINADOR,
        colegioId: 'colegio-B',
      });

      await expect(service.findOneSesion(sesion.id, coordinador)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('lanza NotFoundException si la sesión no existe', async () => {
      sesionRepository.findOne.mockResolvedValue(null);
      const admin = buildUser({ id: 'admin-1', rol: UserRole.ADMIN });

      await expect(service.findOneSesion('no-existe', admin)).rejects.toThrow(NotFoundException);
    });
  });

  describe('registrarAsistencias', () => {
    it('rechaza si un instructor intenta registrar asistencia en una sesión ajena', async () => {
      sesionRepository.findOne.mockResolvedValue(buildSesion());
      const otroInstructor = buildUser({ id: 'instructor-B', rol: UserRole.INSTRUCTOR });

      await expect(
        service.registrarAsistencias('sesion-1', { asistencias: [] } as any, otroInstructor),
      ).rejects.toThrow(ForbiddenException);
      expect(asistenciaRepository.save).not.toHaveBeenCalled();
    });
  });
});
