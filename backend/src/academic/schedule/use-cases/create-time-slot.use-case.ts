import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto.js';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class CreateTimeSlotUseCase {
  private readonly logger = new Logger(CreateTimeSlotUseCase.name);

  constructor(private readonly repo: ITimeSlotRepository) {}

  async execute(dto: CreateTimeSlotDto) {
    const conflict = await this.repo.findByOrder(dto.order);
    if (conflict) {
      throw new ConflictException(
        `Time slot with order ${dto.order} already exists`,
      );
    }

    const ts = await this.repo.create(dto);
    this.logger.log(`TimeSlot created: ${ts.name}`);
    return ts;
  }
}
