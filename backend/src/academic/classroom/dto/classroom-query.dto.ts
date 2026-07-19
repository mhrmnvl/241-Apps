import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';
import { toBooleanFromTransform } from '../../../shared/validators/boolean.transformer.js';

export class ClassroomQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by curriculum ID (UUID)' })
  @IsOptional()
  @IsUUID()
  curriculumId?: string;

  @ApiPropertyOptional({ description: 'Filter by academic year ID (UUID)' })
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @ApiPropertyOptional({ description: 'Filter by classroom level ID (UUID)' })
  @IsOptional()
  @IsUUID()
  gradeId?: string;

  @ApiPropertyOptional({ description: 'Search by code or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isActive?: boolean;
}
