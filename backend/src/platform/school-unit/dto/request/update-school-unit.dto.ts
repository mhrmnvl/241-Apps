import { PartialType } from '@nestjs/swagger';
import { CreateSchoolUnitDto } from './create-school-unit.dto.js';

export class UpdateSchoolUnitDto extends PartialType(CreateSchoolUnitDto) {}
