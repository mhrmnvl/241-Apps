import type { PaginationMeta } from '../../../../shared/domain/interfaces/repository.interface.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubjectTeacherResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  teacherId!: string;

  @ApiPropertyOptional({
    description: 'Classroom this teacher is assigned to for the subject',
    example: { id: 'uuid', name: 'VII-A' },
  })
  classroom?: { id: string; name: string } | null;

  @ApiPropertyOptional({
    description: 'Teacher identity; `name` falls back to NIP when unset',
    example: { nip: '198001012005011001', user: { profile: { name: 'Budi' } } },
  })
  teacher?: {
    nip: string | null;
    user: { profile: { name: string | null } | null } | null;
  } | null;
}

export class SubjectResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Mathematics' })
  name!: string;

  @ApiPropertyOptional({
    description:
      'Teaching assignments for the ACTIVE semester only. One entry per ' +
      'classroom, so the same subject may list different teachers per class.',
    type: () => [SubjectTeacherResponseDto],
  })
  teachingAssignments?: SubjectTeacherResponseDto[];
}

export class SubjectListResponseDto {
  @ApiProperty({ type: () => [SubjectResponseDto] })
  data!: SubjectResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 12, totalPages: 2 } })
  meta!: PaginationMeta;
}
