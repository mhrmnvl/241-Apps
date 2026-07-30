import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTimeSlotDto } from '../dto/request/update-time-slot.dto.js';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class UpdateTimeSlotUseCase {
  private readonly logger = new Logger(UpdateTimeSlotUseCase.name);

  constructor(private readonly repository: ITimeSlotRepository) {}

  async execute(id: string, dto: UpdateTimeSlotDto) {
    const existing = await this.repository.findById(id);
    if (!existing)
      throw new NotFoundException(`TimeSlot with ID ${id} not found`);

    if (dto.order !== undefined) {
      const conflict = await this.repository.findByOrder(dto.order, id);
      if (conflict) {
        throw new ConflictException(
          `Time slot with order ${dto.order} already exists`,
        );
      }
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`TimeSlot updated: ${id}`);
    return updated;
  }
}
