import { ApiProperty } from '@nestjs/swagger';
import { EducationStatus } from '@prisma/client';
import { ProfileOwnerRefDto } from '../../../dto/response/profile-owner-ref.dto.js';

/**
 * One schooling record, as it leaves the server.
 *
 * Transcribed from the Prisma model plus `EDUCATIONAL_HISTORY_INCLUDE`, not
 * from `EducationalHistoryEntity` — that interface types `status` as a loose
 * string where the column is an enum with four values.
 */
export class EducationalHistoryResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ format: 'uuid' }) profileId!: string;

  @ApiProperty({ example: 'SD' }) level!: string;

  @ApiProperty({ example: 'SDN Cibeureum 1' }) institution!: string;

  @ApiProperty({ example: 'IPA', nullable: true }) major!: string | null;

  @ApiProperty({ example: 2014 }) startYear!: number;

  @ApiProperty({
    example: 2020,
    nullable: true,
    description: 'Null while the person is still there.',
  })
  endYear!: number | null;

  @ApiProperty({ enum: EducationStatus, example: EducationStatus.GRADUATED })
  status!: EducationStatus;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ type: () => ProfileOwnerRefDto })
  profile!: ProfileOwnerRefDto;
}
