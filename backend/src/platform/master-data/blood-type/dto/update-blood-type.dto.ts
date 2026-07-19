import { PartialType } from '@nestjs/swagger';
import { CreateBloodTypeDto } from './create-blood-type.dto.js';

export class UpdateBloodTypeDto extends PartialType(CreateBloodTypeDto) {}
