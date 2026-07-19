import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnnouncementClassroomItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440004',
    format: 'uuid',
  })
  classroomId!: string;
}

export class AnnouncementResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440019' })
  id!: string;

  @ApiProperty({ example: 'Pengumuman Jadwal Ujian' })
  title!: string;

  @ApiProperty({ example: 'Ujian akhir semester dilaksanakan 20 Maret 2024.' })
  description!: string;

  @ApiProperty({ example: '2024-03-05T00:00:00Z' })
  date!: Date;

  @ApiPropertyOptional({
    description: 'Target classrooms. Empty = school-wide announcement.',
    type: () => [AnnouncementClassroomItemDto],
  })
  classrooms?: AnnouncementClassroomItemDto[];
}

export class AnnouncementListResponseDto {
  @ApiProperty({ type: () => [AnnouncementResponseDto] })
  data!: AnnouncementResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 5, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
