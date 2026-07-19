import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateStudentEnrollmentDto } from './create-student-enrollment.dto.js';

export class BulkCreateStudentEnrollmentDto {
  @ApiProperty({ type: [CreateStudentEnrollmentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateStudentEnrollmentDto)
  enrollments: CreateStudentEnrollmentDto[];
}
