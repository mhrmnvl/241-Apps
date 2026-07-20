import { ApiProperty } from '@nestjs/swagger';

export class ClassroomSupervisorResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  classroomId!: string;

  @ApiProperty({ format: 'uuid' })
  teacherId!: string;

  @ApiProperty({ format: 'uuid' })
  semesterId!: string;
}

export class ClassroomSupervisorListResponseDto {
  @ApiProperty({ type: () => [ClassroomSupervisorResponseDto] })
  data!: ClassroomSupervisorResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 20, totalPages: 2 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
