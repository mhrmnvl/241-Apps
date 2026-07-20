import { ApiProperty } from '@nestjs/swagger';

export class EducationResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440013' })
  id!: string;

  @ApiProperty({ example: 'S1' })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class EducationListResponseDto {
  @ApiProperty({ type: () => [EducationResponseDto] })
  data!: EducationResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 6, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
