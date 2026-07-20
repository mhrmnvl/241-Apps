import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClassroomStructureResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  classroomId!: string;

  @ApiProperty({ format: 'uuid' })
  semesterId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  presidentId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  vicePresidentId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  secretaryId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  treasurerId!: string | null;
}

export class ClassroomStructureListResponseDto {
  @ApiProperty({ type: () => [ClassroomStructureResponseDto] })
  data!: ClassroomStructureResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 20, totalPages: 2 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
