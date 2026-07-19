import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SemesterType } from '@prisma/client';
import { UpdateSemesterTypeDto } from '../dto/update-semester-type.dto.js';
import { ISemesterTypeRepository } from '../domain/interfaces/semester-type-repository.interface.js';

@Injectable()
export class UpdateSemesterTypeUseCase {
  constructor(private readonly repository: ISemesterTypeRepository) {}

  async execute(id: string, dto: UpdateSemesterTypeDto): Promise<SemesterType> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Semester Type with ID ${id} not found`);
    }

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.repository.findByName(dto.name);
      if (duplicate) {
        throw new ConflictException(
          `Semester Type with name "${dto.name}" already exists`,
        );
      }
    }

    return this.repository.update(id, dto);
  }
}
