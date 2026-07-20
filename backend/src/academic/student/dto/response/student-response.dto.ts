import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'User account ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  userId!: string;

  @ApiProperty({ example: '2024001' })
  nis!: string;

  @ApiProperty({ example: '0012345678' })
  nisn!: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Student master status' })
  status!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Classroom Level ID',
  })
  gradeId?: string;
}

export class StudentListResponseDto {
  @ApiProperty({ type: () => [StudentResponseDto] })
  data!: StudentResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 50, totalPages: 5 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
