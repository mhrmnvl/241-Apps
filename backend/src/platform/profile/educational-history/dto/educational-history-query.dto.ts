import { ApiPropertyOptional } from '@nestjs/swagger';
import { EducationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class EducationalHistoryQueryDto {
  @ApiPropertyOptional({ description: 'Filter by profile ID' })
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiPropertyOptional({ example: 'SMA' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ enum: EducationStatus })
  @IsOptional()
  @IsEnum(EducationStatus)
  status?: EducationStatus;

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
