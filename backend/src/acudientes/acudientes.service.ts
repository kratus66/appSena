import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Acudiente } from './entities/acudiente.entity';
import { CreateAcudienteDto } from './dto/create-acudiente.dto';
import { UpdateAcudienteDto } from './dto/update-acudiente.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { AprendicesService } from '../aprendices/aprendices.service';

@Injectable()
export class AcudientesService {
  constructor(
    @InjectRepository(Acudiente)
    private readonly acudienteRepository: Repository<Acudiente>,
    private readonly aprendicesService: AprendicesService,
  ) {}

  async create(
    aprendizId: string,
    createAcudienteDto: CreateAcudienteDto,
    user: User,
  ): Promise<Acudiente> {
    // Verificar que el aprendiz existe y el usuario tiene permiso
    const aprendiz = await this.aprendicesService.findOne(aprendizId, user);

    // Verificar que no exista otro acudiente con el mismo teléfono para este aprendiz
    const existingAcudiente = await this.acudienteRepository.findOne({
      where: {
        aprendizId,
        telefono: createAcudienteDto.telefono,
      },
    });

    if (existingAcudiente) {
      throw new ConflictException(
        `Ya existe un acudiente con el teléfono ${createAcudienteDto.telefono} para este aprendiz`,
      );
    }

    const acudiente = this.acudienteRepository.create({
      ...createAcudienteDto,
      aprendizId,
      createdById: user.id,
    });

    return this.acudienteRepository.save(acudiente);
  }

  async findAllByAprendiz(aprendizId: string, user: User): Promise<Acudiente[]> {
    // Verificar que el aprendiz existe y el usuario tiene permiso
    await this.aprendicesService.findOne(aprendizId, user);

    return this.acudienteRepository.find({
      where: { aprendizId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Acudiente> {
    const acudiente = await this.acudienteRepository.findOne({
      where: { id },
      relations: ['aprendiz', 'aprendiz.ficha'],
    });

    if (!acudiente) {
      throw new NotFoundException(`Acudiente con ID ${id} no encontrado`);
    }

    // Si es INSTRUCTOR, verificar que el aprendiz pertenece a una de sus fichas
    if (user.rol === UserRole.INSTRUCTOR) {
      // TODO: Verificar que el instructor es responsable de la ficha del aprendiz
      // Por ahora permitimos el acceso
    }

    return acudiente;
  }

  async update(
    id: string,
    updateAcudienteDto: UpdateAcudienteDto,
    user: User,
  ): Promise<Acudiente> {
    const acudiente = await this.findOne(id, user);

    // Si se está actualizando el teléfono, verificar que no exista otro acudiente con el mismo teléfono para este aprendiz
    if (updateAcudienteDto.telefono && updateAcudienteDto.telefono !== acudiente.telefono) {
      const existingAcudiente = await this.acudienteRepository.findOne({
        where: {
          aprendizId: acudiente.aprendizId,
          telefono: updateAcudienteDto.telefono,
        },
      });

      if (existingAcudiente) {
        throw new ConflictException(
          `Ya existe un acudiente con el teléfono ${updateAcudienteDto.telefono} para este aprendiz`,
        );
      }
    }

    Object.assign(acudiente, {
      ...updateAcudienteDto,
      updatedById: user.id,
    });

    return this.acudienteRepository.save(acudiente);
  }

  async remove(id: string, user: User): Promise<void> {
    // Solo ADMIN puede eliminar acudientes
    if (user.rol !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden eliminar acudientes');
    }

    const acudiente = await this.findOne(id, user);

    acudiente.deletedById = user.id;
    await this.acudienteRepository.save(acudiente);
    await this.acudienteRepository.softDelete(id);
  }
}
