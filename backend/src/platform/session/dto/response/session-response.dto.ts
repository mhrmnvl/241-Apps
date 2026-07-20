import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({
    description: 'The session unique identifier',
    example: 'f3b07384-d113-4ec2-a5d9-4d64bc86ef34',
  })
  id!: string;

  @ApiProperty({
    description: 'The User ID owner of this session',
    example: '9a9e3ee8-4a56-4c74-a029-798dfb0a3909',
  })
  userId!: string;

  @ApiProperty({
    description: 'The user agent of the client browser',
    example: 'Mozilla/5.0...',
    required: false,
  })
  userAgent?: string | null;

  @ApiProperty({
    description: 'The IP address of the client device',
    example: '127.0.0.1',
    required: false,
  })
  ipAddress?: string | null;

  @ApiProperty({ description: 'The expiration date' })
  expiresAt!: Date;

  @ApiProperty({ description: 'Last active date/time' })
  lastUsedAt!: Date;

  @ApiProperty({ description: 'Revocation date/time', required: false })
  revokedAt?: Date | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt!: Date;
}
