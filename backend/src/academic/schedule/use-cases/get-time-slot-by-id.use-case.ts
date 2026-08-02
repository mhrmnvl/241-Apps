import { Injectable, NotFoundException } from '@nestjs/common';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class GetTimeSlotByIdUseCase {
  constructor(private readonly timeSlotRepository: ITimeSlotRepository) {}

  async execute(id: string) {
    const ts = await this.timeSlotRepository.findById(id);
    if (!ts) throw new NotFoundException(`TimeSlot with ID ${id} not found`);
    return ts;
  }
}
