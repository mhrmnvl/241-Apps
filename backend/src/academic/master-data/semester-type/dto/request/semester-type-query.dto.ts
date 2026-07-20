import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../../shared/dto/pagination.dto.js';
import { Transform } from 'class-transformer';

export class SemesterTypeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
