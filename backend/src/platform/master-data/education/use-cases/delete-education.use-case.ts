import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IEducationRepository } from '../domain/interfaces/education-repository.interface.js';

@Injectable()
export class DeleteEducationUseCase {
  private readonly logger = new Logger(DeleteEducationUseCase.name);

  constructor(private readonly educationRepository: IEducationRepository) {}

  async execute(id: string): Promise<void> {
    const [education, usageCount] = await Promise.all([
      this.educationRepository.findById(id),
      this.educationRepository.countParentUsage(id),
    ]);

    if (!education)
      throw new NotFoundException(`Education with ID ${id} not found`);

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete education because it is currently assigned to ${usageCount} parent(s)`,
      );
    }

    await this.educationRepository.softDelete(id);
    this.logger.log(`Education soft-deleted: ${id}`);
  }
}
