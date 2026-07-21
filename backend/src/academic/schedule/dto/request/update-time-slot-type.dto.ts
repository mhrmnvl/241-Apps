import { PartialType } from '@nestjs/swagger';
import { CreateTimeSlotTypeDto } from './create-time-slot-type.dto.js';

export class UpdateTimeSlotTypeDto extends PartialType(CreateTimeSlotTypeDto) {}
