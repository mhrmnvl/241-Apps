import { Injectable } from '@nestjs/common';
import { TeacherQueryDto } from '../dto/request/teacher-query.dto.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';

@Injectable()
export class GetTeachersUseCase {
  constructor(private readonly repository: TeacherRepository) {}

  async execute(query: TeacherQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
