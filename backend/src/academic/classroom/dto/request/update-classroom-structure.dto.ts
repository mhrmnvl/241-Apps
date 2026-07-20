import { PartialType } from '@nestjs/swagger';
import { CreateClassroomStructureDto } from './create-classroom-structure.dto.js';

export class UpdateClassroomStructureDto extends PartialType(
  CreateClassroomStructureDto,
) {}
