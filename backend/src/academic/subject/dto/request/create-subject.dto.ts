import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
