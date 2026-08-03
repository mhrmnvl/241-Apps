import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { DayEnum as Day } from '../../../../shared/domain/enums/day.enum.js';

export class CreateScheduleDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() teachingAssignmentId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() timeSlotId: string;
  @ApiProperty({ enum: Day }) @IsEnum(Day) day: Day;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) room?: string;
}
