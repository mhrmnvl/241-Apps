import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';

@Injectable()
export class DeleteStudentParentUseCase {
  private readonly logger = new Logger(DeleteStudentParentUseCase.name);

  constructor(
    private readonly studentParentRepository: IStudentParentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const link = await this.studentParentRepository.findById(id);
    if (!link)
      throw new NotFoundException(
        `Student-parent link with ID ${id} not found`,
      );

    await this.studentParentRepository.remove(id);
    this.logger.log(`Student-parent link deleted: ${id}`);
  }
}
