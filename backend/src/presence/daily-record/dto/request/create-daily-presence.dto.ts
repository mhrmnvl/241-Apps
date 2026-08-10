import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { PresenceDayStatusEnum } from '../../domain/entities/daily-presence.entity.js';
import type { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';

const DAY_STATUSES = [
  'PRESENT',
  'LATE',
  'ABSENT',
  'ON_LEAVE',
  'OFFICIAL_DUTY',
  'NOT_EXPECTED',
] as const;

export class CreateDailyPresenceDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() userId!: string;

  @ApiProperty({ enum: ['STUDENT', 'EMPLOYEE'] })
  @IsIn(['STUDENT', 'EMPLOYEE'])
  subjectType!: PresenceSubjectTypeEnum;

  @ApiProperty({ example: '2026-08-10' }) @IsDateString() date!: string;

  @ApiProperty({ enum: DAY_STATUSES })
  @IsIn(DAY_STATUSES)
  status!: PresenceDayStatusEnum;

  @ApiPropertyOptional() @IsOptional() @IsDateString() checkInAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() checkOutAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({ example: 'Lupa membawa kartu, hadir sesuai jadwal' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  reason!: string;
}
