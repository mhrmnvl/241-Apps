import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateStudentParentDto } from '../dto/update-student-parent.dto.js';
import { StudentParentRepository } from '../repositories/student-parent.repository.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';

@Injectable()
export class UpdateStudentParentUseCase {
  private readonly logger = new Logger(UpdateStudentParentUseCase.name);

  constructor(private readonly repo: StudentParentRepository) {}

  async execute(
    id: string,
    dto: UpdateStudentParentDto,
  ): Promise<StudentParentWithDetails> {
    const current = await this.repo.findById(id);
    if (!current)
      throw new NotFoundException(
        `Student-parent link with ID ${id} not found`,
      );

    const updated = await this.repo.update(id, current.studentId, dto);
    this.logger.log(`Student-parent link updated: ${id}`);
    return updated;
  }
}
