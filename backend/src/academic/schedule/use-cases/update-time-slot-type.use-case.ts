import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTimeSlotTypeDto } from '../dto/request/update-time-slot-type.dto.js';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class UpdateTimeSlotTypeUseCase {
  constructor(private readonly timeSlotRepository: ITimeSlotRepository) {}

  async execute(id: string, dto: UpdateTimeSlotTypeDto) {
    const type = await this.timeSlotRepository.findTypeById(id);
    if (!type) {
      throw new NotFoundException('Time slot type not found');
    }
    if (dto.code) {
      const dup = await this.timeSlotRepository.findTypeByCode(dto.code);
      if (dup && dup.id !== id) {
        throw new ConflictException(
          `Time slot type code "${dto.code}" is already in use`,
        );
      }
    }
    return this.timeSlotRepository.updateType(id, {
      code: dto.code,
      name: dto.name,
      isLesson: dto.isLesson,
      days: dto.days,
    });
  }
}
