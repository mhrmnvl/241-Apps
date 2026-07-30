import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';

@Injectable()
export class DeletePositionUseCase {
  private readonly logger = new Logger(DeletePositionUseCase.name);

  constructor(private readonly repository: IPositionRepository) {}

  async execute(id: string): Promise<void> {
    const [position, inUse] = await Promise.all([
      this.repository.findById(id),
      this.repository.countActiveAssignments(id),
    ]);

    if (!position)
      throw new NotFoundException(`Position with ID ${id} not found`);

    if (inUse > 0)
      throw new ConflictException(
        `Position is still assigned to ${inUse} teacher(s) and cannot be deleted`,
      );

    await this.repository.remove(id);
    this.logger.log(`Position deleted: ${id}`);
  }
}
