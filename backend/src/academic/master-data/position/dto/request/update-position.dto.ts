import { PartialType } from '@nestjs/swagger';
import { CreatePositionDto } from './create-position.dto.js';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {}
