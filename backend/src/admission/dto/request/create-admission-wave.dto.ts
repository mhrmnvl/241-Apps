import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
