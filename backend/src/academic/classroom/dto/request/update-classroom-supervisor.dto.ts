import { PartialType } from '@nestjs/swagger';
import { CreateClassroomSupervisorDto } from './create-classroom-supervisor.dto.js';

export class UpdateClassroomSupervisorDto extends PartialType(
  CreateClassroomSupervisorDto,
) {}
