import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAcademicCalendarDto } from './create-academic-calendar.dto.js';

export class UpdateAcademicCalendarDto extends PartialType(
  OmitType(CreateAcademicCalendarDto, ['academicYearId'] as const),
) {}
