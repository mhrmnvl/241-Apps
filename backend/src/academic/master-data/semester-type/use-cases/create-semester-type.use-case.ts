import { ConflictException, Injectable } from '@nestjs/common';
import { SemesterType } from '@prisma/client';
import { CreateSemesterTypeDto } from '../dto/request/create-semester-type.dto.js';
import { ISemesterTypeRepository } from '../domain/interfaces/semester-type-repository.interface.js';

@Injectable()
export class CreateSemesterTypeUseCase {
  constructor(private readonly repository: ISemesterTypeRepository) {}

  async execute(dto: CreateSemesterTypeDto): Promise<SemesterType> {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Semester Type with name "${dto.name}" already exists`,
      );
    }

    return this.repository.create({
      name: dto.name,
      isActive: dto.isActive ?? true,
    });
  }
}
