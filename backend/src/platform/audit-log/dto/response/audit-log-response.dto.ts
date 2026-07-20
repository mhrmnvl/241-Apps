import { ApiProperty } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Audit log UUID',
    example: 'd3b07384-d113-4ec2-a5d9-4d64bc86ef34',
  })
  id!: string;

  @ApiProperty({
    description: 'The User ID who triggered the action',
    example: '9a9e3ee8-4a56-4c74-a029-798dfb0a3909',
    required: false,
  })
  userId?: string | null;

  @ApiProperty({
    description: 'The action triggered',
    example: 'student.create',
  })
  action!: string;

  @ApiProperty({ description: 'The resource acted upon', example: 'students' })
  resource!: string;

  @ApiProperty({
    description: 'The resource ID acted upon',
    example: '9a9e3ee8-4a56-4c74-a029-798dfb0a3909',
    required: false,
  })
  resourceId?: string | null;

  @ApiProperty({
    description: 'Metadata for the action (JSON)',
    required: false,
  })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    description: 'The client IP address',
    example: '127.0.0.1',
    required: false,
  })
  ipAddress?: string | null;

  @ApiProperty({
    description: 'The client user agent string',
    example: 'Mozilla/5.0...',
    required: false,
  })
  userAgent?: string | null;

  @ApiProperty({ description: 'Creation date/time' })
  createdAt!: Date;

  @ApiProperty({
    description: 'User details',
    required: false,
  })
  user?: { id: string; identifier: string } | null;
}
