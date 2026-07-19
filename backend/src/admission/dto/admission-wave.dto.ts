import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto/pagination.dto.js';
import { toBooleanFromTransform } from '../../shared/validators/boolean.transformer.js';

export class CreateAdmissionWaveDto {
  @ApiProperty({ example: 'Gelombang 1 — 2026/2027' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'G1-2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  academicYearId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  schoolUnitId?: string;

  @ApiProperty({ format: 'date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ format: 'date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  quota: number;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  registrationFee: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAdmissionWaveDto extends PartialType(
  CreateAdmissionWaveDto,
) {}

export class AdmissionWaveQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBooleanFromTransform)
  @IsBoolean()
  isActive?: boolean;
}

export class AdmissionWaveIdsDto {
  @ApiProperty({ type: [String] })
  @Type(() => String)
  ids: string[];
}
