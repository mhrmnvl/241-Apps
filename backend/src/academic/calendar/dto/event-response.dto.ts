import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AudienceGroupResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440005' })
  id!: string;

  @ApiProperty({ example: 'SISWA' })
  code!: string;

  @ApiProperty({ example: 'Siswa' })
  name!: string;
}

export class EventAudienceItemDto {
  @ApiProperty({ type: () => AudienceGroupResponseDto })
  audienceGroup!: AudienceGroupResponseDto;
}

export class EventClassroomItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440004',
    format: 'uuid',
  })
  classroomId!: string;
}

export class EventResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440018' })
  id!: string;

  @ApiProperty({ example: 'Pekan Ilmiah Siswa' })
  title!: string;

  @ApiProperty({ example: 'Kegiatan pameran karya ilmiah siswa.' })
  description!: string;

  @ApiProperty({ type: () => [EventAudienceItemDto] })
  audiences!: EventAudienceItemDto[];

  @ApiProperty({ example: '2024-03-15T08:00:00Z' })
  startTime!: Date;

  @ApiProperty({ example: '2024-03-15T14:00:00Z' })
  endTime!: Date;

  @ApiPropertyOptional({
    description: 'Target classrooms. Empty = school-wide event.',
    type: () => [EventClassroomItemDto],
  })
  classrooms?: EventClassroomItemDto[];
}

export class EventListResponseDto {
  @ApiProperty({ type: () => [EventResponseDto] })
  data!: EventResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 8, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
