import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';

@Injectable()
export class DeleteClassroomUseCase {
  private readonly logger = new Logger(DeleteClassroomUseCase.name);

  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(id: string): Promise<void> {
    const classRecord = await this.classroomRepository.findById(id);
    if (!classRecord)
      throw new NotFoundException(`Classroom with ID ${id} not found`);

    await this.classroomRepository.remove(id);
    this.logger.log(`Class soft-deleted: ${id}`);
  }
}
