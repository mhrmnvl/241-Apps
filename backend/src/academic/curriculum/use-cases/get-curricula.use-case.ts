import { Injectable } from '@nestjs/common';
import { CurriculaQueryDto } from '../dto/request/curriculum-query.dto.js';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';

@Injectable()
export class GetCurriculaUseCase {
  constructor(private readonly curriculumRepository: ICurriculumRepository) {}

  async execute(query: CurriculaQueryDto) {
    const { data, total, page, limit } =
      await this.curriculumRepository.findAll(query);
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
