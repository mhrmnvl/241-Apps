import { PartialType } from '@nestjs/swagger';
import { CreateTimeSlotDto } from './create-time-slot.dto.js';

export class UpdateTimeSlotDto extends PartialType(CreateTimeSlotDto) {}
