import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AcademicCalendarQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by academic year ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @ApiPropertyOptional({ description: 'Filter by semester ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @ApiPropertyOptional({
    description: 'Filter by calendar type ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50;
}
