import { Injectable } from '@nestjs/common';
import { ClassroomQueryDto } from '../dto/classroom-query.dto.js';
import { ClassroomRepository } from '../repositories/classroom.repository.js';
import { withDisplayName } from '../../../shared/utils/classroom-display-name.helper.js';

@Injectable()
export class GetClassroomsUseCase {
  constructor(private readonly repository: ClassroomRepository) {}

  async execute(query: ClassroomQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    return {
      data: data.map(withDisplayName),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
