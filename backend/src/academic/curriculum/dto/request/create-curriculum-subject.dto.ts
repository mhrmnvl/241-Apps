import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateCurriculumSubjectDto {
  @ApiProperty({ description: 'Curriculum ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  curriculumId: string;

  @ApiProperty({ description: 'Subject ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiPropertyOptional({ description: 'Hours per week', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  hoursPerWeek?: number;

  @ApiPropertyOptional({
    description:
      'Minimum pass mark for this subject under this curriculum. Also fixes the A/B/C/D scale, whose D/C boundary is this value. A teacher may override it for one class.',
    example: 75,
    default: 75,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;
}
