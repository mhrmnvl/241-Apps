import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SubmitLeaveRequestDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() leaveTypeId!: string;
  @ApiProperty({ example: '2026-09-01' }) @IsDateString() startDate!: string;
  @ApiProperty({ example: '2026-09-02' }) @IsDateString() endDate!: string;

  @ApiProperty({ example: 'Keperluan keluarga' })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Surat pendukung' })
  @IsOptional()
  @IsUUID()
  documentFileId?: string;
}
