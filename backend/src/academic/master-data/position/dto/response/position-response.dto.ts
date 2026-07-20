import { ApiProperty } from '@nestjs/swagger';

export class PositionCategoryResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440007' }) id!: string;
  @ApiProperty({ example: 'MANAGEMENT' }) code!: string;
  @ApiProperty({ example: 'Management' }) name!: string;
}

export class PositionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440007' }) id!: string;
  @ApiProperty({ example: 'Kepala Sekolah' }) name!: string;
  @ApiProperty({ type: () => PositionCategoryResponseDto })
  category!: PositionCategoryResponseDto;
  @ApiProperty({ example: true }) isActive!: boolean;
}

export class PositionListResponseDto {
  @ApiProperty({ type: () => [PositionResponseDto] })
  data!: PositionResponseDto[];
  @ApiProperty({ example: { page: 1, limit: 10, total: 15, totalPages: 2 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
