import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RecordScanDto } from './record-scan.dto.js';

export class RecordScanBatchDto {
  @ApiProperty({ type: [RecordScanDto], description: 'An offline flush' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordScanDto)
  scans!: RecordScanDto[];
}
