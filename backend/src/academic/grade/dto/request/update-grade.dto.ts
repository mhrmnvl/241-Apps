import { PartialType } from '@nestjs/swagger';
import { CreateGradeDto } from './create-grade.dto.js';

export class UpdateGradeDto extends PartialType(CreateGradeDto) {}
