import { ApiProperty } from '@nestjs/swagger';
import { ScholarshipStatus } from '@prisma/client';
import { ProfileOwnerRefDto } from '../../../dto/response/profile-owner-ref.dto.js';

/**
 * A scholarship, as it leaves the server.
 *
 * Transcribed from the Prisma model plus `SCHOLARSHIP_INCLUDE`, not from
 * `ScholarshipEntity` — that interface names a `description` this table does
 * not have and types `status` as a loose string where the column is an enum.
 * The enum matters on the wire: a caller can switch on it exhaustively, and a
 * string invites a fourth value that will never arrive.
 */
export class ScholarshipResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ format: 'uuid' }) profileId!: string;

  @ApiProperty({ example: 'Beasiswa Prestasi' }) name!: string;

  @ApiProperty({ example: 'Baznas' }) provider!: string;

  @ApiProperty({ example: 2026 }) year!: number;

  @ApiProperty({ enum: ScholarshipStatus, example: ScholarshipStatus.ACTIVE })
  status!: ScholarshipStatus;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ type: () => ProfileOwnerRefDto })
  profile!: ProfileOwnerRefDto;
}
