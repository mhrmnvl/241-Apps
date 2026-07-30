import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IOccupationRepository } from '../interfaces/occupation-repository.interface.js';

@Injectable()
export class DeleteOccupationUseCase {
  private readonly logger = new Logger(DeleteOccupationUseCase.name);

  constructor(private readonly repository: IOccupationRepository) {}

  async execute(id: string): Promise<void> {
    const [occupation, inUse] = await Promise.all([
      this.repository.findById(id),
      this.repository.countActiveParents(id),
    ]);

    if (!occupation)
      throw new NotFoundException(`Occupation with ID ${id} not found`);

    if (inUse > 0)
      throw new ConflictException(
        `Occupation is used by ${inUse} active parent(s) and cannot be deleted`,
      );

    await this.repository.remove(id);
    this.logger.log(`Occupation deleted: ${id}`);
  }
}
