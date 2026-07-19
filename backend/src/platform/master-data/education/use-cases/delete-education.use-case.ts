import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IEducationRepository } from '../interfaces/education-repository.interface.js';

@Injectable()
export class DeleteEducationUseCase {
  private readonly logger = new Logger(DeleteEducationUseCase.name);

  constructor(private readonly repository: IEducationRepository) {}

  async execute(id: string): Promise<void> {
    const [education, usageCount] = await Promise.all([
      this.repository.findById(id),
      this.repository.countParentUsage(id),
    ]);

    if (!education)
      throw new NotFoundException(`Education with ID ${id} not found`);

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete education because it is currently assigned to ${usageCount} parent(s)`,
      );
    }

    await this.repository.softDelete(id);
    this.logger.log(`Education soft-deleted: ${id}`);
  }
}
