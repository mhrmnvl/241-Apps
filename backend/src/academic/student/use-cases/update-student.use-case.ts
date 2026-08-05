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

    // The student row itself holds only these; profile fields carried by the
    // DTO are persisted through the profile path, not here.
    const updated = await this.studentRepository.update(id, {
      nis: dto.nis,
      nisn: dto.nisn,
      gradeId: dto.gradeId,
      status: dto.status,
    });
    this.logger.log(`Student updated: ${id}`);
    return updated;
  }
}
