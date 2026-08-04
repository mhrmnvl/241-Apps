import { Injectable, Logger } from '@nestjs/common';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { StudentNotFoundException } from '../domain/exceptions/index.js';

@Injectable()
export class DeleteStudentUseCase {
  private readonly logger = new Logger(DeleteStudentUseCase.name);

  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(id: string): Promise<void> {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new StudentNotFoundException(id);

    await this.studentRepository.softDelete(id, student.user.id);
    this.logger.log(`Student soft-deleted: ${id}`);
  }
}
