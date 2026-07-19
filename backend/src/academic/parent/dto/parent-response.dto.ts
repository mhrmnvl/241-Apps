import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncomeRange } from '@prisma/client';

export class ParentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Budi Santoso' })
  name!: string;

  @ApiProperty({ example: '3578010101700001' })
  nik!: string;

  @ApiProperty({ example: 'Surabaya' })
  birthPlace!: string;

  @ApiProperty({ example: '1970-01-01T00:00:00Z' })
  birthDate!: Date;

  @ApiPropertyOptional({ example: 'budi.santoso@email.com' })
  email?: string | null;

  @ApiPropertyOptional({ example: '082345678901' })
  phone?: string | null;

  @ApiProperty({
    format: 'uuid',
    description: 'Occupation ID',
    example: '550e8400-e29b-41d4-a716-446655440012',
  })
  occupationId!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Education ID',
    example: '550e8400-e29b-41d4-a716-446655440013',
  })
  educationId?: string | null;

  @ApiPropertyOptional({
    enum: IncomeRange,
    description: 'Parent income range',
  })
  income?: IncomeRange | null;
}

export class ParentListResponseDto {
  @ApiProperty({ type: () => [ParentResponseDto] })
  data!: ParentResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 20, totalPages: 2 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
