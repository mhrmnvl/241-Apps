import { Injectable } from '@nestjs/common';
import { ReligionQueryDto } from '../dto/request/religion-query.dto.js';
import { IReligionRepository } from '../domain/interfaces/religion-repository.interface.js';

@Injectable()
export class GetReligionsUseCase {
  constructor(private readonly repository: IReligionRepository) {}

  async execute(query: ReligionQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
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
