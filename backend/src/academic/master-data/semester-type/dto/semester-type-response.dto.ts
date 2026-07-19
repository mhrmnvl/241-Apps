import { ApiProperty } from '@nestjs/swagger';

export class SemesterTypeResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  id: string;

  @ApiProperty({ example: 'ODD' })
  name: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class SemesterTypeListResponseDto {
  @ApiProperty({ type: [SemesterTypeResponseDto] })
  data: SemesterTypeResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
