import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) location?: string | null;
  @ApiProperty() isActive!: boolean;

  @ApiPropertyOptional({
    nullable: true,
    description: 'How a silent gate becomes visible rather than inferred',
  })
  lastSeenAt?: Date | null;

  @ApiProperty() tokenIssuedAt!: Date;
}

/** Returned only by register and rotate — the token is unrecoverable after. */
export class DeviceWithTokenResponseDto {
  @ApiProperty({ type: DeviceResponseDto }) device!: DeviceResponseDto;

  @ApiProperty({
    description: 'Shown once. Only its hash is stored.',
  })
  token!: string;
}
