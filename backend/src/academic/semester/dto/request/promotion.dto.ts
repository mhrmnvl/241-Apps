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

export enum PromotionAction {
  PROMOTE = 'PROMOTE',
  REPEAT = 'REPEAT',
  GRADUATE = 'GRADUATE',
}

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

export class PromotionResultDto {
  @ApiProperty() promoted: number;
  @ApiProperty() repeated: number;
  @ApiProperty() graduated: number;
  @ApiProperty() skipped: number;
}

export class PromotionPreviewItemDto {
  @ApiProperty() action: PromotionAction;
  @ApiProperty() studentCount: number;
}

export class PromotionPreviewDto {
  @ApiProperty({ type: [PromotionPreviewItemDto] })
  items: PromotionPreviewItemDto[];
  @ApiProperty() totalStudents: number;
  @ApiProperty() promotedCount: number;
  @ApiProperty() repeatedCount: number;
  @ApiProperty() graduatedCount: number;
}
