import { Injectable } from '@nestjs/common';
import { StudentQueryDto } from '../dto/request/student-query.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';

@Injectable()
export class GetStudentsUseCase {
  constructor(private readonly repo: StudentRepository) {}

  async execute(query: StudentQueryDto): Promise<{
    data: StudentWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { data, total, page, limit } = await this.repo.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
