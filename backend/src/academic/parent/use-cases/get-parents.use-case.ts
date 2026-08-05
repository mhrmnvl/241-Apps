import { Injectable } from '@nestjs/common';
import { ParentQueryDto } from '../dto/request/parent-query.dto.js';
import { IParentRepository } from '../domain/interfaces/parent-repository.interface.js';

@Injectable()
export class GetParentsUseCase {
  constructor(private readonly parentRepository: IParentRepository) {}

  async execute(query: ParentQueryDto) {
    const { data, total, page, limit } = await this.parentRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      occupationId: query.occupationId,
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
