import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  WEEKDAY_COUNT,
  WEEKDAY_MAX,
  WEEKDAY_MIN,
} from '../../constants/weekday.constants.js';

export class CreateAcademicYearDto {
  @ApiProperty({
    description: 'Academic Year Name (e.g., 2024/2025)',
    example: '2025/2026',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: 'Is current active academic year?',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Weekdays school does not run, 0 (Sunday) to 6 (Saturday). ' +
      '[0] is a six-day week, [0, 6] a five-day week, [5] a Friday closure. ' +
      'An empty array means school runs every day.',
    example: [0],
    type: [Number],
    default: [0],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(WEEKDAY_COUNT)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(WEEKDAY_MIN, { each: true })
  @Max(WEEKDAY_MAX, { each: true })
  @Type(() => Number)
  weeklyHolidays?: number[];
}
