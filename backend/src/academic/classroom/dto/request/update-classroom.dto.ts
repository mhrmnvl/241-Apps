import { PartialType } from '@nestjs/swagger';
import { CreateClassroomDto } from './create-classroom.dto.js';

export class UpdateClassroomDto extends PartialType(CreateClassroomDto) {}
