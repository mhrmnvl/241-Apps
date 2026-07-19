import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentParentRepository } from '../repositories/student-parent.repository.js';

@Injectable()
export class DeleteStudentParentUseCase {
  private readonly logger = new Logger(DeleteStudentParentUseCase.name);

  constructor(private readonly repo: StudentParentRepository) {}

  async execute(id: string): Promise<void> {
    const link = await this.repo.findById(id);
    if (!link)
      throw new NotFoundException(
        `Student-parent link with ID ${id} not found`,
      );

    await this.repo.remove(id);
    this.logger.log(`Student-parent link deleted: ${id}`);
  }
}
