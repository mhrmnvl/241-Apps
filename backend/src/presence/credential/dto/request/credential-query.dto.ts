import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';
import type { PresenceSubjectTypeEnum } from '../../domain/entities/credential.entity.js';

export class CredentialQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['STUDENT', 'EMPLOYEE'] })
  @IsOptional()
  @IsIn(['STUDENT', 'EMPLOYEE'])
  subjectType?: PresenceSubjectTypeEnum;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'REVOKED', 'REPLACED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'REVOKED', 'REPLACED'])
  status?: 'ACTIVE' | 'REVOKED' | 'REPLACED';

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Matches the holder name' })
  @IsOptional()
  @IsString()
  search?: string;
}
