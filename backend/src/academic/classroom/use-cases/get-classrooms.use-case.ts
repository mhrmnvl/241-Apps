import { Injectable } from '@nestjs/common';
import { ClassroomQueryDto } from '../dto/request/classroom-query.dto.js';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { withDisplayName } from '../../../shared/utils/classroom-display-name.helper.js';

@Injectable()
export class GetClassroomsUseCase {
  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(query: ClassroomQueryDto) {
    const { data, total, page, limit } =
      await this.classroomRepository.findAll(query);
    return {
      data: data.map(withDisplayName),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
