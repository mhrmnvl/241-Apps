import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClassroomRepository } from '../repositories/classroom.repository.js';

@Injectable()
export class DeleteClassroomUseCase {
  private readonly logger = new Logger(DeleteClassroomUseCase.name);

  constructor(private readonly repository: ClassroomRepository) {}

  async execute(id: string): Promise<void> {
    const classRecord = await this.repository.findById(id);
    if (!classRecord)
      throw new NotFoundException(`Classroom with ID ${id} not found`);

    await this.repository.softDelete(id);
    this.logger.log(`Class soft-deleted: ${id}`);
  }
}
