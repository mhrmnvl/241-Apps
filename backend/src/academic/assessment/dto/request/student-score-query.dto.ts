import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';

export class StudentScoreQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() enrollmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assessmentItemId?: string;
}
