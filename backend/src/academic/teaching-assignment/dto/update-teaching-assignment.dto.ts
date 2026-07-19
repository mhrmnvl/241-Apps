import { PartialType } from '@nestjs/swagger';
import { CreateTeachingAssignmentDto } from './create-teaching-assignment.dto.js';

export class UpdateTeachingAssignmentDto extends PartialType(
  CreateTeachingAssignmentDto,
) {}
