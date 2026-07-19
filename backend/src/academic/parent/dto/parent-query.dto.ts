import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class ParentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, NIK, email, or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by occupation ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440012',
  })
  @IsOptional()
  @IsUUID()
  occupationId?: string;
}
