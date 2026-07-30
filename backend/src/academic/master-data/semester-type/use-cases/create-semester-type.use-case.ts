import { ConflictException, Injectable } from '@nestjs/common';
import {
  ISemesterTypeRepository,
  SemesterType,
} from '../domain/interfaces/semester-type-repository.interface.js';
import { CreateSemesterTypeDto } from '../dto/request/create-semester-type.dto.js';

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
