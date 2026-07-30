import { Injectable } from '@nestjs/common';
import {
  ISemesterTypeRepository,
  SemesterType,
} from '../domain/interfaces/semester-type-repository.interface.js';
import { SemesterTypeQueryDto } from '../dto/request/semester-type-query.dto.js';

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
