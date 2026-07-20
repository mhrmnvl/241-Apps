import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdmissionWaveIdsDto {
  @ApiProperty({ type: [String] })
  @Type(() => String)
  ids: string[];
}
