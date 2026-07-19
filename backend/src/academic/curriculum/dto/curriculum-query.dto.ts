import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';
import { toBooleanFromTransform } from '../../../shared/validators/boolean.transformer.js';

export class CurriculaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by curricula name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by Academic Year ID',
    example: '550e8400-e29b-41d4-a716-446655440009',
  })
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isActive?: boolean;
}
