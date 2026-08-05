import { Injectable } from '@nestjs/common';
import {
  ISemesterTypeRepository,
  SemesterType,
} from '../domain/interfaces/semester-type-repository.interface.js';
import { SemesterTypeQueryDto } from '../dto/request/semester-type-query.dto.js';

@Injectable()
export class GetSemesterTypesUseCase {
  constructor(
    private readonly semesterTypeRepository: ISemesterTypeRepository,
  ) {}

  async execute(query: SemesterTypeQueryDto): Promise<{
    data: SemesterType[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.semesterTypeRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive: query.isActive,
    });
  }
}
