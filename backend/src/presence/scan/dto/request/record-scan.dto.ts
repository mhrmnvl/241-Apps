import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class RecordScanDto {
  @ApiProperty({ description: 'The opaque token read from the card' })
  @IsString()
  @MaxLength(64)
  code!: string;

  @ApiProperty({
    format: 'uuid',
    description:
      'Device-generated. Reused on retry, which is what makes a flush idempotent.',
  })
  @IsUUID()
  clientEventId!: string;

  @ApiPropertyOptional({
    description:
      'Server-anchored derivation, sent only for scans taken offline. Absent means "stamp it now".',
  })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Which anchor produced occurredAt',
  })
  @IsOptional()
  @IsUUID()
  clockAnchorId?: string;
}
