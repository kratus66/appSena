import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DisciplinarioService } from './disciplinario.service';
import { DisciplinaryCase } from './entities/disciplinary-case.entity';
import { CaseAction } from './entities/case-action.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('DisciplinarioService', () => {
  let service: DisciplinarioService;
  let caseRepository: { createQueryBuilder: jest.Mock; findOne: jest.Mock };
  let fichaRepository: { findOne: jest.Mock };
  let aprendizRepository: { findOne: jest.Mock };

  const buildCaso = (overrides: Partial<DisciplinaryCase> = {}): DisciplinaryCase =>
    ({
      id: 'caso-1',
      fichaId: 'ficha-1',
      ficha: { id: 'ficha-1', instructorId: 'instructor-A', colegioId: 'colegio-A' },
      ...overrides,
    }) as unknown as DisciplinaryCase;

  const buildUser = (overrides: Partial<User> = {}): User => ({ ...overrides }) as User;

  // El servicio usa createQueryBuilder(...).leftJoinAndSelect(...)...getOne()
  const mockQueryBuilderReturning = (result: any) => {
    const qb: any = {};
    ['leftJoinAndSelect', 'where', 'andWhere', 'orderBy'].forEach((method) => {
      qb[method] = jest.fn().mockReturnValue(qb);
    });
    qb.getOne = jest.fn().mockResolvedValue(result);
    return qb;
  };

  beforeEach(async () => {
    caseRepository = { createQueryBuilder: jest.fn(), findOne: jest.fn() };
    fichaRepository = { findOne: jest.fn() };
    aprendizRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisciplinarioService,
        { provide: getRepositoryToken(DisciplinaryCase), useValue: caseRepository },
        { provide: getRepositoryToken(CaseAction), useValue: {} },
        { provide: getRepositoryToken(Ficha), useValue: fichaRepository },
        { provide: getRepositoryToken(Aprendiz), useValue: aprendizRepository },
      ],
    }).compile();

    service = module.get<DisciplinarioService>(DisciplinarioService);
  });

  describe('findOne — aislamiento por autorización (regresión SEC-2)', () => {
    it('un INSTRUCTOR puede ver un caso de su propia ficha', async () => {
      const caso = buildCaso();
      caseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilderReturning(caso));
      const instructor = buildUser({ id: 'instructor-A', rol: UserRole.INSTRUCTOR });

      await expect(service.findOne(caso.id, instructor)).resolves.toBe(caso);
    });

    it('un INSTRUCTOR NO puede ver un caso de la ficha de otro instructor', async () => {
      const caso = buildCaso();
      caseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilderReturning(caso));
      const otroInstructor = buildUser({ id: 'instructor-B', rol: UserRole.INSTRUCTOR });

      await expect(service.findOne(caso.id, otroInstructor)).rejects.toThrow(ForbiddenException);
    });

    it('un COORDINADOR de otro colegio NO puede ver el caso (IDOR)', async () => {
      const caso = buildCaso();
      caseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilderReturning(caso));
      const coordinador = buildUser({
        id: 'coord-1',
        rol: UserRole.COORDINADOR,
        colegioId: 'colegio-B',
      });

      await expect(service.findOne(caso.id, coordinador)).rejects.toThrow(ForbiddenException);
    });

    it('lanza NotFoundException si el caso no existe', async () => {
      caseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilderReturning(null));
      const admin = buildUser({ id: 'admin-1', rol: UserRole.ADMIN });

      await expect(service.findOne('no-existe', admin)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      fichaId: 'ficha-1',
      aprendizId: 'aprendiz-1',
      fechaIncidente: '2020-01-01',
    } as any;

    it('rechaza si un instructor intenta crear un caso para la ficha de otro', async () => {
      fichaRepository.findOne.mockResolvedValue({ id: 'ficha-1', instructorId: 'instructor-A' });
      aprendizRepository.findOne.mockResolvedValue({ id: 'aprendiz-1', fichaId: 'ficha-1' });
      const otroInstructor = buildUser({ id: 'instructor-B', rol: UserRole.INSTRUCTOR });

      await expect(service.create(dto, otroInstructor)).rejects.toThrow(ForbiddenException);
    });

    it('rechaza si la ficha del caso no existe', async () => {
      fichaRepository.findOne.mockResolvedValue(null);
      const admin = buildUser({ id: 'admin-1', rol: UserRole.ADMIN });

      await expect(service.create(dto, admin)).rejects.toThrow(NotFoundException);
    });
  });
});
