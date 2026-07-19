import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentParentRepository } from '../repositories/student-parent.repository.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';

@Injectable()
export class GetStudentParentByIdUseCase {
  constructor(private readonly repo: StudentParentRepository) {}

  async execute(id: string): Promise<StudentParentWithDetails> {
    const link = await this.repo.findById(id);
    if (!link)
      throw new NotFoundException(
        `Student-parent link with ID ${id} not found`,
      );
    return link;
  }
}
