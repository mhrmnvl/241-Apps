import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository.js';

@Injectable()
export class DeleteStudentUseCase {
  private readonly logger = new Logger(DeleteStudentUseCase.name);

  constructor(private readonly repository: StudentRepository) {}

  async execute(id: string): Promise<void> {
    const student = await this.repository.findById(id);
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);

    await this.repository.softDelete(id, student.user.id);
    this.logger.log(`Student soft-deleted: ${id}`);
  }
}
