import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSubjectDto {
  @ApiPropertyOptional({
    description: 'Subject Code (unique, e.g. MTK, IPA)',
    example: 'MTK',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({ description: 'Subject Name', example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'List of Teacher IDs (UUIDs) to attach as teachers',
    type: [String],
    format: 'uuid',
    example: ['uuid-teacher-1'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  teacherIds?: string[];
}
