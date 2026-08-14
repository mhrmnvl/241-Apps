import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';

export class StudentScoreQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() enrollmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assessmentItemId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() semesterId?: string;
  // No `studentId` here on purpose. Whose marks these are is decided by the
  // route — the management one answers for everyone, the self-service one for
  // the caller — and a field on the DTO is a field a caller can send.
}
