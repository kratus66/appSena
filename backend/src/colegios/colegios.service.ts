import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateColegioDto } from './dto/create-colegio.dto';
import { UpdateColegioDto } from './dto/update-colegio.dto';
import { Colegio } from './entities/colegio.entity';

@Injectable()
export class ColegiosService {
  constructor(
    @InjectRepository(Colegio)
    private readonly colegioRepository: Repository<Colegio>,
  ) {}

  async create(createColegioDto: CreateColegioDto): Promise<Colegio> {
    // Verificar si ya existe un colegio con ese NIT
    const colegioExistente = await this.colegioRepository.findOne({
      where: { nit: createColegioDto.nit },
    });

    if (colegioExistente) {
      throw new ConflictException(`Ya existe un colegio con el NIT ${createColegioDto.nit}`);
    }

    const colegio = this.colegioRepository.create(createColegioDto);
    return await this.colegioRepository.save(colegio);
  }

  async findAll(activo?: boolean): Promise<Colegio[]> {
    const where = activo !== undefined ? { activo } : {};
    return await this.colegioRepository.find({
      where,
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Colegio> {
    const colegio = await this.colegioRepository.findOne({
      where: { id },
    });

    if (!colegio) {
      throw new NotFoundException(`Colegio con ID ${id} no encontrado`);
    }

    return colegio;
  }

  async findByDepartamento(departamento: string): Promise<Colegio[]> {
    return await this.colegioRepository.find({
      where: { departamento, activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findByCiudad(ciudad: string): Promise<Colegio[]> {
    return await this.colegioRepository.find({
      where: { ciudad, activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async update(id: string, updateColegioDto: UpdateColegioDto): Promise<Colegio> {
    const colegio = await this.findOne(id);
    Object.assign(colegio, updateColegioDto);
    return await this.colegioRepository.save(colegio);
  }

  async remove(id: string): Promise<void> {
    const colegio = await this.findOne(id);
    await this.colegioRepository.remove(colegio);
  }

  async toggleActivo(id: string): Promise<Colegio> {
    const colegio = await this.findOne(id);
    colegio.activo = !colegio.activo;
    return await this.colegioRepository.save(colegio);
  }
}
