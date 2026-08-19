import {
  IsArray,
  Matches,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicCalendarDto {
  @ApiProperty({ description: 'Academic year ID', format: 'uuid' })
  @IsUUID()
  academicYearId: string;

  @ApiPropertyOptional({
    description: 'Semester ID (optional — omit for cross-semester entries)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @ApiProperty({ example: 'Semester Ganjil 2024/2025', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'academic-calendar-type-uuid',
    description: 'Academic Calendar Type ID',
  })
  @IsUUID()
  typeId: string;

  @ApiProperty({
    description: 'Start date (ISO 8601 date)',
    example: '2024-07-15',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date (ISO 8601 date)',
    example: '2024-12-20',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Clock hours the entry runs, as HH:mm. Optional, and both or neither — ' +
      'a term and a holiday have no hours; an activity does.',
    example: '08:00',
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be HH:mm',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '12:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime must be HH:mm' })
  endTime?: string;

  @ApiPropertyOptional({
    description:
      'Classrooms this entry is for. Omit or leave empty for the whole ' +
      'school, which is the ordinary case — a holiday needs no list.',
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  classroomIds?: string[];
}
