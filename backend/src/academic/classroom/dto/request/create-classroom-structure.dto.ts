import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateClassroomStructureDto {
  @ApiProperty({
    description: 'Class ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @IsUUID()
  @IsNotEmpty()
  classroomId: string;

  @ApiProperty({
    description: 'Semester ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsUUID()
  @IsNotEmpty()
  semesterId: string;

  @ApiPropertyOptional({
    description: 'Class President student ID (UUID)',
  })
  @IsOptional()
  @IsUUID()
  presidentId?: string;

  @ApiPropertyOptional({
    description: 'Vice President student ID (UUID)',
  })
  @IsOptional()
  @IsUUID()
  vicePresidentId?: string;

  @ApiPropertyOptional({
    description: 'Secretary student ID (UUID)',
  })
  @IsOptional()
  @IsUUID()
  secretaryId?: string;

  @ApiPropertyOptional({
    description: 'Treasurer student ID (UUID)',
  })
  @IsOptional()
  @IsUUID()
  treasurerId?: string;
}
