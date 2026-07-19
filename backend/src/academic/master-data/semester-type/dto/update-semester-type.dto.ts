import { PartialType } from '@nestjs/swagger';
import { CreateSemesterTypeDto } from './create-semester-type.dto.js';

export class UpdateSemesterTypeDto extends PartialType(CreateSemesterTypeDto) {}
