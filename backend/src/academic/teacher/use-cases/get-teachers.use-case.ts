import { Injectable } from '@nestjs/common';
import { TeacherQueryDto } from '../dto/request/teacher-query.dto.js';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';

@Injectable()
export class GetTeachersUseCase {
  constructor(private readonly teacherRepository: ITeacherRepository) {}

  async execute(query: TeacherQueryDto) {
    const { data, total, page, limit } =
      await this.teacherRepository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
