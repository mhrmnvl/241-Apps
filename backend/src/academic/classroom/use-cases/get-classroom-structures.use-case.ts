import { Injectable } from '@nestjs/common';
import { ClassroomStructureQueryDto } from '../dto/request/classroom-structure-query.dto.js';
import { IClassroomStructureRepository } from '../domain/interfaces/classroom-structure-repository.interface.js';

@Injectable()
export class GetClassroomStructuresUseCase {
  constructor(
    private readonly classroomStructureRepository: IClassroomStructureRepository,
  ) {}

  async execute(query: ClassroomStructureQueryDto) {
    const { data, total, page, limit } =
      await this.classroomStructureRepository.findAll(query);
    const totalPages = Math.ceil(total / limit);
    return { data, meta: { page, limit, total, totalPages } };
  }
}
