import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import type { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';

export class PresenceRecapQueryDto {
  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @ApiProperty({ example: 8 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiPropertyOptional({ enum: ['STUDENT', 'EMPLOYEE'], default: 'EMPLOYEE' })
  @IsOptional()
  @IsIn(['STUDENT', 'EMPLOYEE'])
  subjectType?: PresenceSubjectTypeEnum;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
