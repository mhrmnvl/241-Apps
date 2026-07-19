import { ApiPropertyOptional } from '@nestjs/swagger';
import { ParentRelation } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';
import { toBooleanFromTransform } from '../../../shared/validators/boolean.transformer.js';

export class StudentParentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by student name/NIS/NISN or parent name/NIK',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by student ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    enum: ParentRelation,
    description: 'Filter by relation',
  })
  @IsOptional()
  @IsEnum(ParentRelation)
  relation?: ParentRelation;

  @ApiPropertyOptional({ description: 'Filter by primary relation' })
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isPrimary?: boolean;
}
