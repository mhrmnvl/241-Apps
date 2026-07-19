import { ApiProperty } from '@nestjs/swagger';

export class OccupationResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440012' }) id!: string;
  @ApiProperty({ example: 'Wiraswasta' }) name!: string;
  @ApiProperty({ example: true }) isActive!: boolean;
}

export class OccupationListResponseDto {
  @ApiProperty({ type: () => [OccupationResponseDto] })
  data!: OccupationResponseDto[];
  @ApiProperty({ example: { page: 1, limit: 10, total: 20, totalPages: 2 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
