import { Injectable } from '@nestjs/common';
import { SemesterQueryDto } from '../dto/request/semester-query.dto.js';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';

@Injectable()
export class GetSemestersUseCase {
  constructor(private readonly semesterRepository: ISemesterRepository) {}

  async execute(query: SemesterQueryDto) {
    const { data, total, page, limit } =
      await this.semesterRepository.findAll(query);
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
