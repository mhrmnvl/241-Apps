import { ApiProperty } from '@nestjs/swagger';
import { LeaveTreatment, PresenceSubjectType } from '@prisma/client';

/**
 * A kind of leave the school recognises, as it leaves the server.
 *
 * Transcribed from the Prisma model: the queries select no columns, so every
 * scalar is on the wire.
 *
 * `treatment` is the field the rest of presence reasons about — it decides
 * whether a day off counts as attended, excused or absent — so it is typed as
 * the enum rather than as a string. A caller switching on it can be told by the
 * compiler when a fifth treatment appears; a string cannot.
 */
export class LeaveTypeResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'SAKIT' }) code!: string;

  @ApiProperty({ example: 'Sakit' }) name!: string;

  @ApiProperty({
    enum: LeaveTreatment,
    description: 'How a day under this leave is counted.',
  })
  treatment!: LeaveTreatment;

  @ApiProperty({ example: true }) consumesQuota!: boolean;

  @ApiProperty({
    example: 12,
    nullable: true,
    description:
      'Null when the leave is not capped, or does not consume quota.',
  })
  annualQuota!: number | null;

  @ApiProperty({ example: true }) requiresDocument!: boolean;

  @ApiProperty({
    enum: PresenceSubjectType,
    description: 'Whether this leave is for staff, students, or both.',
  })
  appliesTo!: PresenceSubjectType;

  @ApiProperty({
    example: true,
    description:
      'Retired kinds stay on record so past requests keep their meaning; the ' +
      'list hides them unless asked for.',
  })
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;
}
