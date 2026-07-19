import { PartialType } from '@nestjs/swagger';
import { CreateCurriculumSubjectDto } from './create-curriculum-subject.dto.js';

export class UpdateCurriculumSubjectDto extends PartialType(
  CreateCurriculumSubjectDto,
) {}
