import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPositionRepository } from '../domain/interfaces/position-repository.interface.js';

@Injectable()
export class DeletePositionUseCase {
  private readonly logger = new Logger(DeletePositionUseCase.name);

  constructor(private readonly positionRepository: IPositionRepository) {}

  async execute(id: string): Promise<void> {
    const [position, inUse] = await Promise.all([
      this.positionRepository.findById(id),
      this.positionRepository.countActiveAssignments(id),
    ]);

    if (!position)
      throw new NotFoundException(`Position with ID ${id} not found`);

    if (inUse > 0)
      throw new ConflictException(
        `Position is still assigned to ${inUse} teacher(s) and cannot be deleted`,
      );

    await this.positionRepository.remove(id);
    this.logger.log(`Position deleted: ${id}`);
  }
}
