import { Injectable } from '@nestjs/common';
import { ClassroomStructureQueryDto } from '../dto/request/classroom-structure-query.dto.js';
import { ClassroomStructureRepository } from '../repositories/classroom-structures.repository.js';

@Injectable()
export class GetClassroomStructuresUseCase {
  constructor(private readonly repository: ClassroomStructureRepository) {}

  async execute(query: ClassroomStructureQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    const totalPages = Math.ceil(total / limit);
    return { data, meta: { page, limit, total, totalPages } };
  }
}
