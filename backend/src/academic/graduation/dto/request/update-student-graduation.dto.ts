import { PartialType } from '@nestjs/swagger';
import { CreateStudentGraduationDto } from './create-student-graduation.dto.js';

export class UpdateStudentGraduationDto extends PartialType(
  CreateStudentGraduationDto,
) {}
