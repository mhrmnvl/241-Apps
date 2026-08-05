import { Injectable } from '@nestjs/common';
import { BloodTypeQueryDto } from '../dto/request/blood-type-query.dto.js';
import { IBloodTypeRepository } from '../domain/interfaces/blood-type-repository.interface.js';

@Injectable()
export class GetBloodTypesUseCase {
  constructor(private readonly bloodTypeRepository: IBloodTypeRepository) {}

  async execute(query: BloodTypeQueryDto) {
    const { data, total, page, limit } = await this.bloodTypeRepository.findAll(
      {
        page: query.page,
        limit: query.limit,
        search: query.search,
        isActive: query.isActive,
      },
    );
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
