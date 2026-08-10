import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CredentialHolderDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: '2024001' }) identifier!: string;
  @ApiProperty({ nullable: true }) displayName!: string | null;
  @ApiProperty({ nullable: true }) photoUrl!: string | null;
}

export class CredentialResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) userId!: string;
  @ApiProperty({ enum: ['STUDENT', 'EMPLOYEE'] }) subjectType!: string;
  @ApiProperty({ enum: ['ACTIVE', 'REVOKED', 'REPLACED'] }) status!: string;
  @ApiProperty() issuedAt!: Date;
  @ApiPropertyOptional({ nullable: true }) revokedAt?: Date | null;
  @ApiPropertyOptional({ nullable: true }) revokedReason?: string | null;
  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  replacedById?: string | null;
  @ApiProperty({ type: CredentialHolderDto }) holder!: CredentialHolderDto;
}

/**
 * The only response carrying `code`.
 *
 * Returned by issue, replace, and the print payload — never by a list or a
 * detail read. Keeping it a separate class rather than an optional field on
 * `CredentialResponseDto` is what makes an accidental leak visible in the
 * controller's declared return type rather than invisible in a mapper.
 */
export class CredentialWithCodeResponseDto extends CredentialResponseDto {
  @ApiProperty({
    description:
      'Printed as the QR. Shown once at issue, then only for printing.',
  })
  code!: string;
}
