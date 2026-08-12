import { ApiProperty } from '@nestjs/swagger';

/**
 * What `GET /auth/me` answers: who the caller is and what they may do.
 *
 * This is the payload every frontend bootstraps from, so it stays deliberately
 * small — no biodata, no relations. The full profile is `GET /profiles/me`,
 * which loads a six-level graph and is fetched later, only where it is shown.
 */
export class SessionIdentityDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({ example: 'admin01' })
  identifier!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 'Ahmad Fauzi', nullable: true })
  name!: string | null;

  @ApiProperty({ example: ['ADMIN'], type: [String] })
  roles!: string[];

  /** Deduplicated union of the permission codes granted by every role held. */
  @ApiProperty({
    example: ['students.read', 'presence-records.read'],
    type: [String],
  })
  permissions!: string[];
}
