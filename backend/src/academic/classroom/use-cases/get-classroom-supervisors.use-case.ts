import { Injectable } from '@nestjs/common';
import { ClassroomSupervisorQueryDto } from '../dto/classroom-supervisor-query.dto.js';
import { ClassroomSupervisorsRepository } from '../repositories/classroom-supervisors.repository.js';

@Injectable()
export class GetClassroomSupervisorsUseCase {
  constructor(private readonly repo: ClassroomSupervisorsRepository) {}

  async execute(query: ClassroomSupervisorQueryDto) {
    const { data, total, page, limit } = await this.repo.findAll(query);
    const totalPages = Math.ceil(total / limit);
    return { data, meta: { page, limit, total, totalPages } };
  }
}
