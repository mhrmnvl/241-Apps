import { ApiProperty } from '@nestjs/swagger';

export class EmploymentTypeResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440007' }) id!: string;
  @ApiProperty({ example: 'PNS' }) code!: string;
  @ApiProperty({ example: 'Civil Servant' }) name!: string;
}

export class EmploymentTypeListResponseDto {
  @ApiProperty({ type: () => [EmploymentTypeResponseDto] })
  data!: EmploymentTypeResponseDto[];
  @ApiProperty({ example: { page: 1, limit: 10, total: 5, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
