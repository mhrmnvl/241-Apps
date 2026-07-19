import { ApiProperty } from '@nestjs/swagger';

export class PositionCategoryResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440007' }) id!: string;
  @ApiProperty({ example: 'MANAGEMENT' }) code!: string;
  @ApiProperty({ example: 'Management' }) name!: string;
}

export class PositionCategoryListResponseDto {
  @ApiProperty({ type: () => [PositionCategoryResponseDto] })
  data!: PositionCategoryResponseDto[];
  @ApiProperty({ example: { page: 1, limit: 10, total: 4, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
