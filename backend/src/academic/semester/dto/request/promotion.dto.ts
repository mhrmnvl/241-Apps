import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PromotionAction } from '../../domain/enums/promotion-action.enum.js';

/** One student's decision — kept beside the payload that nests it. */
export class PromotionStudentDto {
  @ApiProperty({ description: 'Student ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Source classroom ID from current semester',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceClassroomId: string;

  @ApiPropertyOptional({
    description:
      'Target classroom ID in new AY. Required for PROMOTE/REPEAT, omit for GRADUATE.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  targetClassroomId?: string;

  @ApiProperty({
    description: 'Promotion action',
    enum: PromotionAction,
    example: 'PROMOTE',
  })
  @IsEnum(PromotionAction)
  action: PromotionAction;

  @ApiPropertyOptional({
    description: 'Reason for declining promotion (required when REPEAT)',
  })
  @IsOptional()
  @IsString()
  declineReason?: string;
}

export class PromotionDto {
  @ApiProperty({
    description: 'Source semester ID (e.g., Genap 2024/2025)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceSemesterId: string;

  @ApiProperty({
    description: 'Target semester ID (e.g., Ganjil 2025/2026)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  targetSemesterId: string;

  @ApiProperty({
    description: 'Per-student promotion decisions',
    type: [PromotionStudentDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PromotionStudentDto)
  students: PromotionStudentDto[];
}
