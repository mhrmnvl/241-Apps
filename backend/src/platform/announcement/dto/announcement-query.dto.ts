import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class AnnouncementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by class ID',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @ApiPropertyOptional({
    description: 'Search by announcement title or description',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
