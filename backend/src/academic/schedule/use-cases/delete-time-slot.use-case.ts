import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class DeleteTimeSlotUseCase {
  private readonly logger = new Logger(DeleteTimeSlotUseCase.name);

  constructor(private readonly repository: ITimeSlotRepository) {}

  async execute(id: string): Promise<void> {
    const [ts, inUse] = await Promise.all([
      this.repository.findById(id),
      this.repository.countSchedulesUsing(id),
    ]);

    if (!ts) throw new NotFoundException(`TimeSlot with ID ${id} not found`);

    if (inUse > 0)
      throw new ConflictException(
        `TimeSlot is still used by ${inUse} active lesson(s) and cannot be deleted`,
      );

    await this.repository.remove(id);
    this.logger.log(`TimeSlot deleted: ${id}`);
  }
}
