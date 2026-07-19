import { PartialType } from '@nestjs/swagger';
import { CreateEducationDto } from './create-education.dto.js';

export class UpdateEducationDto extends PartialType(CreateEducationDto) {}
