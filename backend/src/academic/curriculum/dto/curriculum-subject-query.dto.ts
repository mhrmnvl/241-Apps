import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class CurriculumSubjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by Curriculum ID' })
  @IsOptional()
  @IsUUID()
  curriculumId?: string;

  @ApiPropertyOptional({ description: 'Filter by Classroom Level ID' })
  @IsOptional()
  @IsUUID()
  gradeId?: string;

  @ApiPropertyOptional({ description: 'Filter by Subject ID' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;
}
