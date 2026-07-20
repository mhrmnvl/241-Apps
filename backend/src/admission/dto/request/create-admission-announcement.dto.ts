import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';
import { toBooleanFromTransform } from '../../../shared/validators/boolean.transformer.js';

export class CreateAdmissionAnnouncementDto {
  @ApiProperty({ example: 'Pengumuman Hasil Seleksi Gelombang 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Target wave; empty = all waves',
  })
  @IsOptional()
  @IsUUID()
  waveId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateAdmissionAnnouncementDto extends PartialType(
  CreateAdmissionAnnouncementDto,
) {}

export class AdmissionAnnouncementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  waveId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isPublished?: boolean;
}
