import { ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';
import { toBooleanFromTransform } from '../../../shared/validators/boolean.transformer.js';

export class StudentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, NIS, or NISN' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Filter by semester ID — shows students enrolled in that semester',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @ApiPropertyOptional({
    description: 'Filter by class ID via enrollment',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @ApiPropertyOptional({
    enum: StudentStatus,
    description: 'Filter by student status',
  })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({
    description: 'Filter by active status (user.isActive)',
  })
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isActive?: boolean;
}
