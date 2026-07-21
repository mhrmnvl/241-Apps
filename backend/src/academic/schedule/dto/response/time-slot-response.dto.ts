import { ApiProperty } from '@nestjs/swagger';

export class TimeSlotTypeResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440008' })
  id!: string;

  @ApiProperty({ example: 'LESSON' })
  code!: string;

  @ApiProperty({ example: 'Lesson' })
  name!: string;

  @ApiProperty({
    example: true,
    description:
      'Whether this type is a regular lesson slot (can hold a subject)',
  })
  isLesson!: boolean;

  @ApiProperty({
    example: ['MONDAY'],
    description: 'Weekdays this type applies to; empty means every day',
  })
  days!: string[];
}

export class TimeSlotResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  id!: string;

  @ApiProperty({ example: 'Jam ke-1' })
  name!: string;

  @ApiProperty({ example: '1970-01-01T07:00:00.000Z' })
  startTime!: Date;

  @ApiProperty({ example: '1970-01-01T07:30:00.000Z' })
  endTime!: Date;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ type: () => TimeSlotTypeResponseDto })
  type!: TimeSlotTypeResponseDto;
}
