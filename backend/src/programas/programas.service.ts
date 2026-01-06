import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProgramaDto } from './dto/create-programa.dto';
import { UpdateProgramaDto } from './dto/update-programa.dto';
import { Programa } from './entities/programa.entity';

@Injectable()
export class ProgramasService {
  constructor(
    @InjectRepository(Programa)
    private readonly programaRepository: Repository<Programa>,
  ) {}

  async create(createProgramaDto: CreateProgramaDto): Promise<Programa> {
    // Verificar si ya existe un programa con ese código
    const programaExistente = await this.programaRepository.findOne({
      where: { codigo: createProgramaDto.codigo },
    });

    if (programaExistente) {
      throw new ConflictException(
        `Ya existe un programa con el código ${createProgramaDto.codigo}`,
      );
    }

    const programa = this.programaRepository.create(createProgramaDto);
    return await this.programaRepository.save(programa);
  }

  async findAll(activo?: boolean, nivelFormacion?: string): Promise<Programa[]> {
    const where: any = {};
    
    if (activo !== undefined) {
      where.activo = activo;
    }
    
    if (nivelFormacion) {
      where.nivelFormacion = nivelFormacion;
    }

    return await this.programaRepository.find({
      where,
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Programa> {
    const programa = await this.programaRepository.findOne({
      where: { id },
    });

    if (!programa) {
      throw new NotFoundException(`Programa con ID ${id} no encontrado`);
    }

    return programa;
  }

  async findByCodigo(codigo: string): Promise<Programa> {
    const programa = await this.programaRepository.findOne({
      where: { codigo },
    });

    if (!programa) {
      throw new NotFoundException(`Programa con código ${codigo} no encontrado`);
    }

    return programa;
  }

  async findByAreaConocimiento(area: string): Promise<Programa[]> {
    return await this.programaRepository.find({
      where: { areaConocimiento: area, activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findByNivelFormacion(nivel: string): Promise<Programa[]> {
    return await this.programaRepository.find({
      where: { nivelFormacion: nivel, activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async update(id: string, updateProgramaDto: UpdateProgramaDto): Promise<Programa> {
    const programa = await this.findOne(id);
    Object.assign(programa, updateProgramaDto);
    return await this.programaRepository.save(programa);
  }

  async remove(id: string): Promise<void> {
    const programa = await this.findOne(id);
    await this.programaRepository.remove(programa);
  }

  async toggleActivo(id: string): Promise<Programa> {
    const programa = await this.findOne(id);
    programa.activo = !programa.activo;
    return await this.programaRepository.save(programa);
  }

  async getEstadisticas() {
    const total = await this.programaRepository.count();
    const activos = await this.programaRepository.count({ where: { activo: true } });
    
    const porNivel = await this.programaRepository
      .createQueryBuilder('programa')
      .select('programa.nivelFormacion', 'nivel')
      .addSelect('COUNT(*)', 'cantidad')
      .where('programa.activo = :activo', { activo: true })
      .groupBy('programa.nivelFormacion')
      .getRawMany();

    return {
      total,
      activos,
      inactivos: total - activos,
      porNivel,
    };
  }
}
