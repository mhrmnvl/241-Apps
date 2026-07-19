import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubjectResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Mathematics' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Assigned teachers (from TeachingAssignment join)',
    type: [Object],
  })
  teachingAssignments?: { teacherId: string }[];
}

export class SubjectListResponseDto {
  @ApiProperty({ type: () => [SubjectResponseDto] })
  data!: SubjectResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 12, totalPages: 2 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
