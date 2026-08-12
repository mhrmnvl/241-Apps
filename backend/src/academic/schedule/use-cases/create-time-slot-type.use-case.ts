import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTimeSlotTypeDto } from '../dto/request/create-time-slot-type.dto.js';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class CreateTimeSlotTypeUseCase {
  constructor(private readonly timeSlotRepository: ITimeSlotRepository) {}

  async execute(dto: CreateTimeSlotTypeDto) {
    const existing = await this.timeSlotRepository.findTypeByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Time slot type code "${dto.code}" is already in use`,
      );
    }
    return this.timeSlotRepository.createType({
      code: dto.code,
      name: dto.name,
      isLesson: dto.isLesson,
      days: dto.days,
    });
  }
}
