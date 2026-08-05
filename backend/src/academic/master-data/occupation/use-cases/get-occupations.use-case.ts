import { Injectable } from '@nestjs/common';
import { OccupationQueryDto } from '../dto/request/occupation-query.dto.js';
import { IOccupationRepository } from '../domain/interfaces/occupation-repository.interface.js';

@Injectable()
export class GetOccupationsUseCase {
  constructor(private readonly occupationRepository: IOccupationRepository) {}

  async execute(query: OccupationQueryDto) {
    const { data, total, page, limit } =
      await this.occupationRepository.findAll({
        page: query.page,
        limit: query.limit,
        search: query.search,
        isActive: query.isActive,
      });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
