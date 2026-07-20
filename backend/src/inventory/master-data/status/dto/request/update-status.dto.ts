import { PartialType } from '@nestjs/swagger';
import { CreateStatusDto } from './create-status.dto.js';

export class UpdateStatusDto extends PartialType(CreateStatusDto) {}
