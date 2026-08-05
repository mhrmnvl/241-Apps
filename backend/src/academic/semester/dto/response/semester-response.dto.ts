import { ApiProperty } from '@nestjs/swagger';
import type { PaginationMeta } from '../../../../shared/domain/interfaces/repository.interface.js';

export class SemesterResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440009' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  typeId!: string;

  @ApiProperty({
    example: { id: '550e8400-e29b-41d4-a716-446655440010', name: 'ODD' },
  })
  type!: { id: string; name: string };

  @ApiProperty({ example: false })
  isActive!: boolean;

  @ApiProperty({
    example: { id: '550e8400-e29b-41d4-a716-446655440009', name: '2024/2025' },
  })
  academicYear!: { id: string; name: string };
}

export class SemesterListResponseDto {
  @ApiProperty({ type: () => [SemesterResponseDto] })
  data!: SemesterResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 5, totalPages: 1 } })
  meta!: PaginationMeta;
}
