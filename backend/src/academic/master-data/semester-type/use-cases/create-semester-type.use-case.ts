import { ConflictException, Injectable } from '@nestjs/common';
import {
  ISemesterTypeRepository,
  SemesterType,
} from '../domain/interfaces/semester-type-repository.interface.js';
import { CreateSemesterTypeDto } from '../dto/request/create-semester-type.dto.js';

@Injectable()
export class CreateSemesterTypeUseCase {
  constructor(
    private readonly semesterTypeRepository: ISemesterTypeRepository,
  ) {}

  async execute(dto: CreateSemesterTypeDto): Promise<SemesterType> {
    const existing = await this.semesterTypeRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Semester Type with name "${dto.name}" already exists`,
      );
    }

    return this.semesterTypeRepository.create({
      name: dto.name,
      ...(dto.sequence !== undefined && { sequence: dto.sequence }),
      isActive: dto.isActive ?? true,
    });
  }
}
