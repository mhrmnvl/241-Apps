import { PartialType } from '@nestjs/swagger';
import { CreateCurriculaDto } from './create-curriculum.dto.js';

export class UpdateCurriculaDto extends PartialType(CreateCurriculaDto) {}
