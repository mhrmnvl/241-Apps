import { Injectable } from '@nestjs/common';
import { BloodTypeQueryDto } from '../dto/request/blood-type-query.dto.js';
import { IBloodTypeRepository } from '../domain/interfaces/blood-type-repository.interface.js';

@Injectable()
export class GetBloodTypesUseCase {
  constructor(private readonly repository: IBloodTypeRepository) {}

  async execute(query: BloodTypeQueryDto) {
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
