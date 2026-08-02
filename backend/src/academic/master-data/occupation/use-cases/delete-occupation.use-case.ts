import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IOccupationRepository } from '../domain/interfaces/occupation-repository.interface.js';

@Injectable()
export class DeleteOccupationUseCase {
  private readonly logger = new Logger(DeleteOccupationUseCase.name);

  constructor(private readonly occupationRepository: IOccupationRepository) {}

  async execute(id: string): Promise<void> {
    const [occupation, inUse] = await Promise.all([
      this.occupationRepository.findById(id),
      this.occupationRepository.countActiveParents(id),
    ]);

    if (!occupation)
      throw new NotFoundException(`Occupation with ID ${id} not found`);

    if (inUse > 0)
      throw new ConflictException(
        `Occupation is used by ${inUse} active parent(s) and cannot be deleted`,
      );

    await this.occupationRepository.remove(id);
    this.logger.log(`Occupation deleted: ${id}`);
  }
}
