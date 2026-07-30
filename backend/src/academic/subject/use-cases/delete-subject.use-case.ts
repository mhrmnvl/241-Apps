import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';

@Injectable()
export class DeleteSubjectUseCase {
  private readonly logger = new Logger(DeleteSubjectUseCase.name);

  constructor(private readonly repository: ISubjectRepository) {}

  async execute(id: string): Promise<void> {
    const subject = await this.repository.findById(id);
    if (!subject)
      throw new NotFoundException(`Subject with ID ${id} not found`);

    await this.repository.remove(id);
    this.logger.log(`Subject hard-deleted: ${id}`);
  }
}
