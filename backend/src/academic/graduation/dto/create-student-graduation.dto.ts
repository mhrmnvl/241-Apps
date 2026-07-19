import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateStudentGraduationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsOptional()
  @IsDateString()
  graduationDate?: string;

  @ApiPropertyOptional({ example: 'DN-01/2026' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  certificateNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
