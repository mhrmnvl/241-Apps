import { ApiProperty } from '@nestjs/swagger';

export class CurriculaResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440008' })
  id!: string;

  @ApiProperty({ example: 'Kurikulum Merdeka 2024' })
  name!: string;
}

export class CurriculaListResponseDto {
  @ApiProperty({ type: () => [CurriculaResponseDto] })
  data!: CurriculaResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 3, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
