import type { PaginationMeta } from '../../../../shared/domain/interfaces/repository.interface.js';
import { ApiProperty } from '@nestjs/swagger';

export class AcademicYearResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440009' })
  id!: string;

  @ApiProperty({ example: '2024/2025' })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({
    description:
      'Weekdays school does not run, 0 (Sunday) to 6 (Saturday). ' +
      'Applied when the calendar is read; no entries are stored for them.',
    example: [0],
    type: [Number],
  })
  weeklyHolidays!: number[];
}

export class AcademicYearListResponseDto {
  @ApiProperty({ type: () => [AcademicYearResponseDto] })
  data!: AcademicYearResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 5, totalPages: 1 } })
  meta!: PaginationMeta;
}
