import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { StudentStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateStudentDto } from './create-student.dto.js';

export class UpdateStudentDto extends PartialType(
  PickType(CreateStudentDto, ['nis', 'nisn', 'gradeId'] as const),
) {
  @ApiPropertyOptional({
    enum: StudentStatus,
    description: 'Student status (ACTIVE, TRANSFERRED, DROPPED, GRADUATED)',
  })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
