import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EnrollmentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateStudentEnrollmentDto } from './create-student-enrollment.dto.js';

export class UpdateStudentEnrollmentDto extends PartialType(
  CreateStudentEnrollmentDto,
) {
  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
