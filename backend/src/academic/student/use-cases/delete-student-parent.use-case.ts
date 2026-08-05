import { Injectable, Logger } from '@nestjs/common';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';
import { StudentParentLinkNotFoundException } from '../domain/exceptions/index.js';

@Injectable()
export class DeleteStudentParentUseCase {
  private readonly logger = new Logger(DeleteStudentParentUseCase.name);

  constructor(
    private readonly studentParentRepository: IStudentParentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const link = await this.studentParentRepository.findById(id);
    if (!link) throw new StudentParentLinkNotFoundException(id);

    await this.studentParentRepository.remove(id);
    this.logger.log(`Student-parent link deleted: ${id}`);
  }
}
