import { ApiProperty } from '@nestjs/swagger';

export class ClassroomResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440004' })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440004',
    description: 'Curriculum UUID',
  })
  curriculumId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440004',
    description: 'Academic Year UUID',
  })
  academicYearId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440004',
    description: 'Classroom Level UUID',
  })
  gradeId!: string;

  @ApiProperty({ example: 'VIII-A', description: 'Classroom code' })
  code!: string;

  @ApiProperty({ example: 'Awesome', description: 'Classroom name' })
  name!: string;

  @ApiProperty({
    example: 'VIII Awesome',
    description: 'Display name (level name + classroom name)',
  })
  displayName!: string;

  @ApiProperty({ example: 30 })
  capacity!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class ClassroomListResponseDto {
  @ApiProperty({ type: () => [ClassroomResponseDto] })
  data!: ClassroomResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 10, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
