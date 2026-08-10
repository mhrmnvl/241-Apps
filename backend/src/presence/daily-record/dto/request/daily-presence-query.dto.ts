import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';
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

export class DailyPresenceQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: '2026-08-10' }) @IsDateString() date!: string;

  @ApiPropertyOptional({ enum: ['STUDENT', 'EMPLOYEE'] })
  @IsOptional()
  @IsIn(['STUDENT', 'EMPLOYEE'])
  subjectType?: PresenceSubjectTypeEnum;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: DAY_STATUSES })
  @IsOptional()
  @IsIn(DAY_STATUSES)
  status?: PresenceDayStatusEnum;
}
