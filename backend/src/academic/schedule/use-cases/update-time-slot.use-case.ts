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

  constructor(private readonly timeSlotRepository: ITimeSlotRepository) {}

  async execute(id: string, dto: UpdateTimeSlotDto) {
    const existing = await this.timeSlotRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`TimeSlot with ID ${id} not found`);

    if (dto.order !== undefined) {
      const conflict = await this.timeSlotRepository.findByOrder(dto.order, id);
      if (conflict) {
        throw new ConflictException(
          `Time slot with order ${dto.order} already exists`,
        );
      }
    }

    const updated = await this.timeSlotRepository.update(id, {
      name: dto.name,
      startTime: dto.startTime,
      endTime: dto.endTime,
      order: dto.order,
      typeId: dto.typeId,
    });
    this.logger.log(`TimeSlot updated: ${id}`);
    return updated;
  }
}
