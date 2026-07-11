import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, UserRole, DependenciaInstructor } from './entities/user.entity';
import { PerfilInstructor } from './entities/perfil-instructor.entity';

describe('UsersService — perfil de instructor 1:1 (punto 5)', () => {
  let service: UsersService;
  let userRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let perfilRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn(),
    };
    perfilRepository = {
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => d),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(PerfilInstructor), useValue: perfilRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('toPublic', () => {
    it('quita el password y aplana el perfil en el nivel superior', () => {
      const user = {
        id: 'u1',
        nombre: 'Ana',
        email: 'ana@sena.edu.co',
        password: 'hash',
        rol: UserRole.INSTRUCTOR,
        perfil: { profesion: 'Ingeniera', dependencia: DependenciaInstructor.TITULADA },
      } as unknown as User;

      const result = service.toPublic(user);

      expect(result.password).toBeUndefined();
      expect(result.perfil).toBeUndefined();
      expect(result.profesion).toBe('Ingeniera');
      expect(result.dependencia).toBe(DependenciaInstructor.TITULADA);
      // Campos de perfil no provistos quedan en null (no undefined)
      expect(result.area).toBeNull();
      expect(result.sede).toBeNull();
    });

    it('para un usuario sin perfil deja los campos de instructor en null', () => {
      const user = {
        id: 'u2',
        nombre: 'Admin',
        password: 'hash',
        rol: UserRole.ADMIN,
        perfil: null,
      } as unknown as User;

      const result = service.toPublic(user);

      expect(result.profesion).toBeNull();
      expect(result.estadoDisponibilidad).toBeNull();
    });
  });

  describe('create', () => {
    it('guarda los campos de instructor en perfil_instructor, no en users', async () => {
      const dto = {
        nombre: 'Ana',
        email: 'ana@sena.edu.co',
        documento: '111',
        password: 'Secret123',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Ingeniera',
        dependencia: DependenciaInstructor.TITULADA,
      } as any;

      userRepository.findOne
        .mockResolvedValueOnce(null) // chequeo de duplicados
        .mockResolvedValue({ id: 'u1', ...dto }); // findOne(id) final
      userRepository.save.mockResolvedValue({ id: 'u1' });
      perfilRepository.findOne.mockResolvedValue(null);

      await service.create(dto);

      // El usuario base se crea SIN los campos de instructor
      const baseArg = userRepository.create.mock.calls[0][0];
      expect(baseArg.profesion).toBeUndefined();
      expect(baseArg.dependencia).toBeUndefined();
      expect(baseArg.nombre).toBe('Ana');

      // El perfil se persiste con los campos de instructor y el userId
      expect(perfilRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          profesion: 'Ingeniera',
          dependencia: DependenciaInstructor.TITULADA,
        }),
      );
    });

    it('no crea perfil si no se envían campos de instructor', async () => {
      const dto = {
        nombre: 'Admin',
        email: 'admin@sena.edu.co',
        documento: '222',
        password: 'Secret123',
        rol: UserRole.ADMIN,
      } as any;

      userRepository.findOne.mockResolvedValueOnce(null).mockResolvedValue({ id: 'u2', ...dto });
      userRepository.save.mockResolvedValue({ id: 'u2' });

      await service.create(dto);

      expect(perfilRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('actualiza el perfil existente sin tocar columnas inexistentes en users', async () => {
      const existingUser = { id: 'u1', nombre: 'Ana', rol: UserRole.INSTRUCTOR } as User;
      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.save.mockResolvedValue(existingUser);
      perfilRepository.findOne.mockResolvedValue({ id: 'p1', userId: 'u1', profesion: 'Vieja' });

      await service.update('u1', { profesion: 'Nueva' } as any);

      expect(perfilRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1', profesion: 'Nueva' }),
      );
    });
  });
});
