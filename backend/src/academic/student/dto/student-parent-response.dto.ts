import { ApiProperty } from '@nestjs/swagger';

export class StudentParentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  studentId!: string;

  @ApiProperty({ format: 'uuid' })
  parentId!: string;

  @ApiProperty({ example: 'MOTHER', description: 'ParentRelation enum' })
  relation!: string;

  @ApiProperty({ example: true })
  isPrimary!: boolean;
}

export class StudentParentListResponseDto {
  @ApiProperty({ type: () => [StudentParentResponseDto] })
  data!: StudentParentResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 15, totalPages: 2 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
