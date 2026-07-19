import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class ClassroomStructureQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by class ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @ApiPropertyOptional({
    description: 'Filter by semester ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsOptional()
  @IsUUID()
  semesterId?: string;
}
