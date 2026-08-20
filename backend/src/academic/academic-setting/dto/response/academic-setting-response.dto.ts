import { ApiProperty } from '@nestjs/swagger';

export class AcademicSettingResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440009' })
  id!: string;

  @ApiProperty({
    description:
      'Weekdays school does not run, 0 (Sunday) to 6 (Saturday). ' +
      'Applied when a calendar is read; no entries are stored for them.',
    example: [0],
    type: [Number],
  })
  weeklyHolidays!: number[];
}
