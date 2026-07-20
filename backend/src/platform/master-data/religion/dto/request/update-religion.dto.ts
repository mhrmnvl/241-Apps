import { PartialType } from '@nestjs/swagger';
import { CreateReligionDto } from './create-religion.dto.js';

export class UpdateReligionDto extends PartialType(CreateReligionDto) {}
