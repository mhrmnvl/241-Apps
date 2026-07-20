import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';
import { toBooleanFromTransform } from '../../../../shared/validators/boolean.transformer.js';

export class TeacherQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, NIP, or NUPTK' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by employment type ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  employmentTypeId?: string;

  @ApiPropertyOptional({
    description:
      'Filter by academic year ID — shows teachers with class supervisor or subject assignment in that year',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status (user.isActive)',
  })
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isActive?: boolean;
}
