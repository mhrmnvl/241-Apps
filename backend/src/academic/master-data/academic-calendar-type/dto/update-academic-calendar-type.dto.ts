import { PartialType } from '@nestjs/swagger';
import { CreateAcademicCalendarTypeDto } from './create-academic-calendar-type.dto.js';

export class UpdateAcademicCalendarTypeDto extends PartialType(
  CreateAcademicCalendarTypeDto,
) {}
