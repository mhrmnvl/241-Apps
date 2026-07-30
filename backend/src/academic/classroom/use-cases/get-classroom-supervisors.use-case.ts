import { Injectable } from '@nestjs/common';
import { ClassroomSupervisorQueryDto } from '../dto/request/classroom-supervisor-query.dto.js';
import { ClassroomSupervisorsRepository } from '../repositories/classroom-supervisors.repository.js';

@Injectable()
export class GetClassroomSupervisorsUseCase {
  constructor(private readonly repository: ClassroomSupervisorsRepository) {}

  async execute(query: ClassroomSupervisorQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    const totalPages = Math.ceil(total / limit);
    return { data, meta: { page, limit, total, totalPages } };
  }
}
