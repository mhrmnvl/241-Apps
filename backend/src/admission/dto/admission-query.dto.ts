import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdmissionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto/pagination.dto.js';

export class AdmissionApplicationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name, registration number, or email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AdmissionStatus })
  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  waveId?: string;
}
