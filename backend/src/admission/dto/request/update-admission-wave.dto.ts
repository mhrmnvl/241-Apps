import { PartialType } from '@nestjs/swagger';
import { CreateAdmissionWaveDto } from './create-admission-wave.dto.js';

export class UpdateAdmissionWaveDto extends PartialType(
  CreateAdmissionWaveDto,
) {}
