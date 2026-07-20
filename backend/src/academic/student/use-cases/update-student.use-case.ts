import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateStudentDto } from '../dto/request/update-student.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';

@Injectable()
export class UpdateStudentUseCase {
  private readonly logger = new Logger(UpdateStudentUseCase.name);

  constructor(private readonly repo: StudentRepository) {}

  async execute(
    id: string,
    dto: UpdateStudentDto,
  ): Promise<StudentWithDetails> {
    const student = await this.repo.findById(id);
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);

    if (dto.nis) {
      const dup = await this.repo.findByNis(dto.nis);
      if (dup && dup.id !== id)
        throw new ConflictException(`NIS "${dto.nis}" is already registered`);
    }
    if (dto.nisn) {
      const dup = await this.repo.findByNisn(dto.nisn);
      if (dup && dup.id !== id)
        throw new ConflictException(`NISN "${dto.nisn}" is already registered`);
    }

    const updated = await this.repo.update(id, dto);
    this.logger.log(`Student updated: ${id}`);
    return updated;
  }
}
