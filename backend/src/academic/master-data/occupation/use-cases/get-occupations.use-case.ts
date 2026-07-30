import { Injectable } from '@nestjs/common';
import { OccupationQueryDto } from '../dto/request/occupation-query.dto.js';
import { IOccupationRepository } from '../interfaces/occupation-repository.interface.js';

@Injectable()
export class GetOccupationsUseCase {
  constructor(private readonly repository: IOccupationRepository) {}

  async execute(query: OccupationQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
