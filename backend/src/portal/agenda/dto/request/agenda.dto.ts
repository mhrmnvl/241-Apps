import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ContentStatus } from '../../../post/domain/enums/content-status.enum.js';

export class CreateAgendaDto {
  @ApiProperty({ example: 'Pentas Seni Akhir Tahun', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ maxLength: 220 })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @ApiProperty({ description: 'HTML — sanitized server-side before storage' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-12-20T01:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-12-20T05:00:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 'Aula MTs Persis 241', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  coverFileId?: string;
}

export class UpdateAgendaDto extends PartialType(CreateAgendaDto) {
  @ApiProperty({ description: 'A mismatch returns 409.', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;
}

export class AgendaVersionDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;
}

export class PublishAgendaDto extends AgendaVersionDto {
  @ApiPropertyOptional({
    description:
      'Go live at this moment instead of now. Must be in the future.',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class AgendaQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Matches title or location' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  includeDeleted?: boolean;
}

/**
 * Anonymous callers reach this. `scope` is the only knob, and it selects
 * between two predicates rather than parameterising visibility — no query
 * string can widen what a visitor sees.
 */
export class PublicAgendaQueryDto {
  @ApiPropertyOptional({ enum: ['upcoming', 'past'], default: 'upcoming' })
  @IsOptional()
  @IsEnum(['upcoming', 'past'])
  scope?: 'upcoming' | 'past' = 'upcoming';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
