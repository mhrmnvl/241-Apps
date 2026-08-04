import { Injectable, Logger } from '@nestjs/common';
import { UpdateStudentDto } from '../dto/request/update-student.dto.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';
import {
  StudentNisAlreadyExistsException,
  StudentNisnAlreadyExistsException,
  StudentNotFoundException,
} from '../domain/exceptions/index.js';

@Injectable()
export class UpdateStudentUseCase {
  private readonly logger = new Logger(UpdateStudentUseCase.name);

  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(
    id: string,
    dto: UpdateStudentDto,
  ): Promise<StudentWithDetails> {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new StudentNotFoundException(id);

    if (dto.nis) {
      const dup = await this.studentRepository.findByNis(dto.nis);
      if (dup && dup.id !== id)
        throw new StudentNisAlreadyExistsException(dto.nis);
    }
    if (dto.nisn) {
      const dup = await this.studentRepository.findByNisn(dto.nisn);
      if (dup && dup.id !== id)
        throw new StudentNisnAlreadyExistsException(dto.nisn);
    }

    const updated = await this.studentRepository.update(id, dto);
    this.logger.log(`Student updated: ${id}`);
    return updated;
  }
}
