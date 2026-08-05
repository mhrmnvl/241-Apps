import { ApiProperty } from '@nestjs/swagger';
import type { PaginationMeta } from '../../../../../shared/domain/interfaces/repository.interface.js';

export class AcademicCalendarTypeResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440013' })
  id!: string;

  @ApiProperty({ example: 'Active Value' })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class AcademicCalendarTypesListResponseDto {
  @ApiProperty({ type: () => [AcademicCalendarTypeResponseDto] })
  data!: AcademicCalendarTypeResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 6, totalPages: 1 } })
  meta!: PaginationMeta;
}
