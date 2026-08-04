import { Injectable } from '@nestjs/common';
import { StudentQueryDto } from '../dto/request/student-query.dto.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class GetStudentsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(
    query: StudentQueryDto,
  ): Promise<PaginatedResponse<StudentWithDetails>> {
    const { data, total, page, limit } =
      await this.studentRepository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
