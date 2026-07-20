import { ApiPropertyOptional } from '@nestjs/swagger';
import { ScholarshipStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class ScholarshipQueryDto {
  @ApiPropertyOptional({ description: 'Filter by profile ID' })
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiPropertyOptional({ enum: ScholarshipStatus })
  @IsOptional()
  @IsEnum(ScholarshipStatus)
  status?: ScholarshipStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
