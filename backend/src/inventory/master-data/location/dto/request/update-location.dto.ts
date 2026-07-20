import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto.js';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
