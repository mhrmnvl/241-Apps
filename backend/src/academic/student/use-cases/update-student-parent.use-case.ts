import { Injectable, Logger } from '@nestjs/common';
import { UpdateStudentParentDto } from '../dto/request/update-student-parent.dto.js';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';
import { StudentParentLinkNotFoundException } from '../domain/exceptions/index.js';

@Injectable()
export class UpdateStudentParentUseCase {
  private readonly logger = new Logger(UpdateStudentParentUseCase.name);

  constructor(
    private readonly studentParentRepository: IStudentParentRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateStudentParentDto,
  ): Promise<StudentParentWithDetails> {
    const current = await this.studentParentRepository.findById(id);
    if (!current) throw new StudentParentLinkNotFoundException(id);

    const updated = await this.studentParentRepository.update(
      id,
      dto,
      current.studentId,
    );
    this.logger.log(`Student-parent link updated: ${id}`);
    return updated;
  }
}
