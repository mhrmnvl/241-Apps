import { Injectable } from '@nestjs/common';
import { ParentQueryDto } from '../dto/request/parent-query.dto.js';
import { ParentRepository } from '../repositories/parent.repository.js';

@Injectable()
export class GetParentsUseCase {
  constructor(private readonly repo: ParentRepository) {}

  async execute(query: ParentQueryDto) {
    const { data, total, page, limit } = await this.repo.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
