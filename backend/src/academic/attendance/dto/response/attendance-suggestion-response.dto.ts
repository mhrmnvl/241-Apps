import { ApiProperty } from '@nestjs/swagger';

export class AttendanceSuggestionDto {
  @ApiProperty({ format: 'uuid' }) enrollmentId!: string;

  @ApiProperty({
    enum: ['PRESENT', 'LATE'],
    description: 'What the gate saw. Unconfirmed until a teacher saves.',
  })
  suggestedStatus!: 'PRESENT' | 'LATE';

  @ApiProperty({ nullable: true }) checkInAt!: Date | null;
  @ApiProperty({ example: 12 }) lateMinutes!: number;
}

export class AttendanceSuggestionResponseDto {
  @ApiProperty() date!: string;
  @ApiProperty({ type: [AttendanceSuggestionDto] })
  suggestions!: AttendanceSuggestionDto[];

  @ApiProperty({
    type: [String],
    description:
      'Enrolments the gate saw nothing for. The screen flags these as needing a decision rather than defaulting them to absent.',
  })
  unscannedEnrollmentIds!: string[];

  @ApiProperty({
    description:
      'False when presence could not be reached — the screen behaves as it did before this feature.',
  })
  available!: boolean;
}
