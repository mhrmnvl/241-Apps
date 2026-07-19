import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentParentDto } from '../dto/create-student-parent.dto.js';
import { StudentParentRepository } from '../repositories/student-parent.repository.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';

@Injectable()
export class CreateStudentParentUseCase {
  private readonly logger = new Logger(CreateStudentParentUseCase.name);

  constructor(private readonly repo: StudentParentRepository) {}

  async execute(
    dto: CreateStudentParentDto,
  ): Promise<StudentParentWithDetails> {
    const [student, parent] = await Promise.all([
      this.repo.findStudent(dto.studentId),
      this.repo.findParent(dto.parentId),
    ]);

    if (!student)
      throw new NotFoundException(`Student with ID ${dto.studentId} not found`);
    if (!parent)
      throw new NotFoundException(`Parent with ID ${dto.parentId} not found`);

    const existing = await this.repo.findPair(dto.studentId, dto.parentId);
    if (existing) {
      throw new ConflictException(
        'This parent is already linked to the specified student',
      );
    }

    const link = await this.repo.create(dto);
    this.logger.log(
      `Student-parent link created (student: ${dto.studentId}, parent: ${dto.parentId})`,
    );
    return link;
  }
}
