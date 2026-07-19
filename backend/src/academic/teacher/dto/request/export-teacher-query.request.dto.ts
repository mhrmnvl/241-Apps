import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { toBooleanFromTransform } from '../../../../shared/validators/boolean.transformer.js';
export class ExportTeacherQueryDto {
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

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isActive?: boolean;
}
