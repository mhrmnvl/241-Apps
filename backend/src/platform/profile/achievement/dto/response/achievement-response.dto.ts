import { ApiProperty } from '@nestjs/swagger';
import { ProfileOwnerRefDto } from '../../../dto/response/profile-owner-ref.dto.js';

/**
 * The achievement type, as `ACHIEVEMENT_INCLUDE` attaches it.
 *
 * `type: true` returns every scalar the model owns, `deletedAt` included, so
 * that is what is documented. Narrowing the select would be a better change
 * than narrowing this description of it.
 */
export class AchievementTypeRefDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'Akademik' }) name!: string;

  @ApiProperty({ example: true }) isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;
}

/**
 * An achievement, as it leaves the server.
 *
 * Transcribed from the Prisma model plus `ACHIEVEMENT_INCLUDE`, not from
 * `AchievementEntity` — that interface names a `rank`, an `organizer` and a
 * `certificateFileId` this table does not have, and marks `level` optional
 * where the column is required. A response type copied from it would describe
 * three fields the server never sends.
 */
export class AchievementResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ format: 'uuid' }) profileId!: string;

  @ApiProperty({ example: 'Juara 1 Olimpiade Matematika' }) name!: string;

  @ApiProperty({ example: 'Kabupaten' }) level!: string;

  @ApiProperty({ format: 'uuid' }) typeId!: string;

  @ApiProperty({ example: 2026 }) year!: number;

  @ApiProperty({ nullable: true }) description!: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ type: () => ProfileOwnerRefDto })
  profile!: ProfileOwnerRefDto;

  @ApiProperty({ type: () => AchievementTypeRefDto })
  type!: AchievementTypeRefDto;
}
