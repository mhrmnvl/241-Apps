import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class DeleteTimeSlotTypeUseCase {
  constructor(private readonly timeSlotRepository: ITimeSlotRepository) {}

  async execute(id: string) {
    const type = await this.timeSlotRepository.findTypeById(id);
    if (!type) {
      throw new NotFoundException('Time slot type not found');
    }
    const inUse = await this.timeSlotRepository.countSlotsUsingType(id);
    if (inUse > 0) {
      throw new ConflictException(
        'Time slot type is still used by a time slot and cannot be deleted',
      );
    }
    return this.timeSlotRepository.removeType(id);
  }
}
