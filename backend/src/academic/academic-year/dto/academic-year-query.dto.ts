import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class AcademicYearQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by academic year name' })
  @IsOptional()
  @IsString()
  search?: string;
}
