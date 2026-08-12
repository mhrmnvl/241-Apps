import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Teachers are not set here. An assignment is per (classroom, semester), so it
 * is created through the teaching-assignment endpoints instead.
 */
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
    description:
      'Minimum pass mark for this subject. Also sets the A/B/C/D scale, whose D/C boundary is this value. A teacher may override it for one class.',
    example: 75,
    default: 75,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  kkm?: number;
}
