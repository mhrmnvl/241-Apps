import { Injectable } from '@nestjs/common';
import { StudentParentQueryDto } from '../dto/request/student-parent-query.dto.js';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class GetStudentParentsListUseCase {
  constructor(
    private readonly studentParentRepository: IStudentParentRepository,
  ) {}

  async execute(
    query: StudentParentQueryDto,
  ): Promise<PaginatedResponse<StudentParentWithDetails>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const items = await this.studentParentRepository.findAll(
      query.studentId ?? '',
    );
    const total = items.length;
    const data = items.slice((page - 1) * limit, page * limit);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }
}
