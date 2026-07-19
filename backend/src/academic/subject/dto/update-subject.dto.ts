import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateSubjectDto {
  @ApiPropertyOptional({
    description: 'Subject Code (unique, e.g. MTK, IPA)',
    example: 'MTK',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ description: 'Subject Name', example: 'Physics' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Replaces ALL assigned teacher IDs. Send empty array [] to remove all teachers. Omit this field to leave teachers unchanged.',
    type: [String],
    format: 'uuid',
    example: ['uuid-teacher-1', 'uuid-teacher-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  teacherIds?: string[];
}
