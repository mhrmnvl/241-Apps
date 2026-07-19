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

  @ApiProperty({ description: 'Classroom Level ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  gradeId: string;

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
}
