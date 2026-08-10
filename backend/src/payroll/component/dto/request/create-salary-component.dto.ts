import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type {
  AttendanceDriverEnum,
  SalaryComponentTypeEnum,
} from '../../domain/entities/salary-component.entity.js';

const TYPES = ['BASE', 'ALLOWANCE', 'ATTENDANCE_DRIVEN', 'DEDUCTION'] as const;
const DRIVERS = [
  'PRESENT_DAYS',
  'ABSENT_DAYS',
  'LATE_COUNT',
  'LATE_MINUTES',
  'EARLY_LEAVE_COUNT',
  'LEAVE_DAYS',
  'OFFICIAL_DUTY_DAYS',
] as const;

export class CreateSalaryComponentDto {
  @ApiProperty({ example: 'POT_ALPA' })
  @Matches(/^[A-Z][A-Z0-9_]{1,29}$/, {
    message: 'code must be UPPER_SNAKE_CASE',
  })
  code!: string;

  @ApiProperty({ example: 'Potongan Alpa' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: TYPES })
  @IsIn(TYPES)
  type!: SalaryComponentTypeEnum;

  @ApiPropertyOptional({
    enum: DRIVERS,
    description:
      'Required for ATTENDANCE_DRIVEN, optional for DEDUCTION, else forbidden.',
  })
  @IsOptional()
  @IsIn(DRIVERS)
  driver?: AttendanceDriverEnum;
}
