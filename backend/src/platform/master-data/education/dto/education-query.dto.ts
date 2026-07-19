import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';
import { toBooleanFromTransform } from '../../../../shared/validators/boolean.transformer.js';

export class EducationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by education name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isActive?: boolean;
}
