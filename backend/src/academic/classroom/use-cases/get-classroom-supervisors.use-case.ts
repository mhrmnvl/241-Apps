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
      await this.classroomSupervisorRepository.findAll({
        page: query.page,
        limit: query.limit,
        classroomId: query.classroomId,
        teacherId: query.teacherId,
        semesterId: query.semesterId,
      });
    const totalPages = Math.ceil(total / limit);
    return { data, meta: { page, limit, total, totalPages } };
  }
}
