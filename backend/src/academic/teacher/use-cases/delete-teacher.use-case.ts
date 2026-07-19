import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TeacherRepository } from '../repositories/teacher.repository.js';

@Injectable()
export class DeleteTeacherUseCase {
  private readonly logger = new Logger(DeleteTeacherUseCase.name);

  constructor(private readonly repository: TeacherRepository) {}

  async execute(id: string): Promise<void> {
    const teacher = await this.repository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);

    await this.repository.softDelete(id, teacher.user.id);
    this.logger.log(`Teacher soft-deleted: ${id}`);
  }
}
