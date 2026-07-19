import { Injectable } from '@nestjs/common';
import { ClassroomStructureQueryDto } from '../dto/classroom-structure-query.dto.js';
import { ClassroomStructuresRepository } from '../repositories/classroom-structures.repository.js';

@Injectable()
export class GetClassroomStructuresUseCase {
  constructor(private readonly repo: ClassroomStructuresRepository) {}

  async execute(query: ClassroomStructureQueryDto) {
    const { data, total, page, limit } = await this.repo.findAll(query);
    const totalPages = Math.ceil(total / limit);
    return { data, meta: { page, limit, total, totalPages } };
  }
}
