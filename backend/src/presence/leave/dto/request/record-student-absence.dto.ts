import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RecordStudentAbsenceDto {
  @ApiProperty({ format: 'uuid', description: 'The student, by user id' })
  @IsUUID()
  studentUserId!: string;

  @ApiProperty({ format: 'uuid' }) @IsUUID() leaveTypeId!: string;

  @ApiProperty({ example: '2026-09-01' }) @IsDateString() startDate!: string;

  @ApiPropertyOptional({
    example: '2026-09-02',
    description: 'Defaults to the start date for a single day.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 'Sick note from the parents' })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  documentFileId?: string;
}
