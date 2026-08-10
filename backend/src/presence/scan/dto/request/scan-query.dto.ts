import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';

const OUTCOMES = [
  'ACCEPTED',
  'DUPLICATE',
  'REJECTED_UNKNOWN',
  'REJECTED_REVOKED',
  'REJECTED_INACTIVE',
  'REJECTED_STALE',
] as const;

export class ScanQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  credentialId?: string;

  @ApiPropertyOptional({ enum: OUTCOMES })
  @IsOptional()
  @IsIn(OUTCOMES)
  outcome?: (typeof OUTCOMES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;
}
