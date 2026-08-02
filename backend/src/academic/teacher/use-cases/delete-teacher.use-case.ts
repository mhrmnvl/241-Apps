import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';

@Injectable()
export class DeleteTeacherUseCase {
  private readonly logger = new Logger(DeleteTeacherUseCase.name);

  constructor(private readonly teacherRepository: ITeacherRepository) {}

  async execute(id: string): Promise<void> {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);

    await this.teacherRepository.softDelete(id, teacher.user.id);
    this.logger.log(`Teacher soft-deleted: ${id}`);
  }
}
