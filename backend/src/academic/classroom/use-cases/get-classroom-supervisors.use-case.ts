import { Injectable } from '@nestjs/common';
import { ClassroomSupervisorQueryDto } from '../dto/request/classroom-supervisor-query.dto.js';
import { IClassroomSupervisorRepository } from '../domain/interfaces/classroom-supervisor-repository.interface.js';

@Injectable()
export class GetClassroomSupervisorsUseCase {
  constructor(
    private readonly classroomSupervisorRepository: IClassroomSupervisorRepository,
  ) {}

  async execute(query: ClassroomSupervisorQueryDto) {
    const { data, total, page, limit } =
      await this.classroomSupervisorRepository.findAll(query);
    const totalPages = Math.ceil(total / limit);
    return { data, meta: { page, limit, total, totalPages } };
  }
}
