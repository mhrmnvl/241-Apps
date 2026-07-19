import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class EventQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by class ID',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @ApiPropertyOptional({
    description: 'Filter by audience group ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  audienceGroupId?: string;

  @ApiPropertyOptional({ description: 'Search by event title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
