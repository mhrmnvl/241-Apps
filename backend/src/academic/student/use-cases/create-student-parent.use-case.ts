import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateStudentParentDto } from '../dto/request/create-student-parent.dto.js';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';
import {
  StudentNotFoundException,
  StudentParentAlreadyLinkedException,
} from '../domain/exceptions/index.js';

@Injectable()
export class CreateStudentParentUseCase {
  private readonly logger = new Logger(CreateStudentParentUseCase.name);

  constructor(
    private readonly studentParentRepository: IStudentParentRepository,
  ) {}

  async execute(
    dto: CreateStudentParentDto,
  ): Promise<StudentParentWithDetails> {
    const [student, parent] = await Promise.all([
      this.studentParentRepository.findStudent(dto.studentId),
      this.studentParentRepository.findParent(dto.parentId),
    ]);

    if (!student) throw new StudentNotFoundException(dto.studentId);
    if (!parent)
      throw new NotFoundException(`Parent with ID ${dto.parentId} not found`);

    const existing = await this.studentParentRepository.findPair(
      dto.studentId,
      dto.parentId,
    );
    if (existing) {
      throw new StudentParentAlreadyLinkedException();
    }

    const link = await this.studentParentRepository.create({
      studentId: dto.studentId,
      parentId: dto.parentId,
      relation: dto.relation,
      isPrimary: dto.isPrimary,
    });
    this.logger.log(
      `Student-parent link created (student: ${dto.studentId}, parent: ${dto.parentId})`,
    );
    return link;
  }
}
