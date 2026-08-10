import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { PresenceDayStatusEnum } from '../../domain/entities/daily-presence.entity.js';

const DAY_STATUSES = [
  'PRESENT',
  'LATE',
  'ABSENT',
  'ON_LEAVE',
  'OFFICIAL_DUTY',
  'NOT_EXPECTED',
] as const;

export class UpdateDailyPresenceDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  checkInAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  checkOutAt?: string | null;

  @ApiPropertyOptional({ enum: DAY_STATUSES })
  @IsOptional()
  @IsIn(DAY_STATUSES)
  status?: PresenceDayStatusEnum;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;

  /**
   * Required, not optional. A correction with no stated reason is
   * indistinguishable from tampering by anything except trust (FR-013).
   */
  @ApiProperty({ example: 'Lupa tap kartu, hadir sesuai jadwal piket' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  reason!: string;
}
