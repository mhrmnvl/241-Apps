import { SemesterTypeEntity } from '../domain/entities/semester-type.entity.js';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ISemesterTypeRepository } from '../domain/interfaces/semester-type-repository.interface.js';
import { UpdateSemesterTypeDto } from '../dto/request/update-semester-type.dto.js';

@Injectable()
export class UpdateSemesterTypeUseCase {
  constructor(
    private readonly semesterTypeRepository: ISemesterTypeRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateSemesterTypeDto,
  ): Promise<SemesterTypeEntity> {
    const existing = await this.semesterTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Semester Type with ID ${id} not found`);
    }

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.semesterTypeRepository.findByName(dto.name);
      if (duplicate) {
        throw new ConflictException(
          `Semester Type with name "${dto.name}" already exists`,
        );
      }
    }

    return this.semesterTypeRepository.update(id, {
      name: dto.name,
      isActive: dto.isActive,
    });
  }
}
