import { Injectable } from '@nestjs/common';
import { StudentParentQueryDto } from '../dto/request/student-parent-query.dto.js';
import { StudentParentRepository } from '../repositories/student-parent.repository.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';

@Injectable()
export class GetStudentParentsListUseCase {
  constructor(private readonly repo: StudentParentRepository) {}

  async execute(query: StudentParentQueryDto): Promise<{
    data: StudentParentWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { data, total, page, limit } = await this.repo.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
