import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IEmploymentTypeRepository } from '../interfaces/employment-type-repository.interface.js';

@Injectable()
export class DeleteEmploymentTypeUseCase {
  private readonly logger = new Logger(DeleteEmploymentTypeUseCase.name);

  constructor(private readonly repo: IEmploymentTypeRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Employment type with ID ${id} not found`);
    }

    const inUseCount = await this.repo.countTeachersWithEmploymentType(id);
    if (inUseCount > 0) {
      throw new ConflictException(
        `Employment type is in use by ${inUseCount} teachers and cannot be deleted`,
      );
    }

    await this.repo.remove(id);
    this.logger.log(`Employment type deleted: ${id}`);
  }
}
