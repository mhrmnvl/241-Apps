import { ApiProperty } from '@nestjs/swagger';

export class AcademicYearResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440009' })
  id!: string;

  @ApiProperty({ example: '2024/2025' })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class AcademicYearListResponseDto {
  @ApiProperty({ type: () => [AcademicYearResponseDto] })
  data!: AcademicYearResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 5, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
