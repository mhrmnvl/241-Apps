import { Injectable } from '@nestjs/common';
import { SemesterType } from '@prisma/client';
import { SemesterTypeQueryDto } from '../dto/semester-type-query.dto.js';
import { ISemesterTypeRepository } from '../domain/interfaces/semester-type-repository.interface.js';

@Injectable()
export class GetSemesterTypesUseCase {
  constructor(private readonly repository: ISemesterTypeRepository) {}

  async execute(query: SemesterTypeQueryDto): Promise<{
    data: SemesterType[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.repository.findAll(query);
  }
}
