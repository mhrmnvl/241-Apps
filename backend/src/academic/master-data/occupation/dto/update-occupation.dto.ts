import { PartialType } from '@nestjs/swagger';
import { CreateOccupationDto } from './create-occupation.dto.js';

export class UpdateOccupationDto extends PartialType(CreateOccupationDto) {}
