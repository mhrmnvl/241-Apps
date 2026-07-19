import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class SubjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by subject name or code' })
  @IsOptional()
  @IsString()
  search?: string;
}
