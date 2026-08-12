import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class EnrollApplicantDto {
  @ApiProperty({ example: '20260001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nis: string;

  @ApiProperty({ example: '0091234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nisn: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Grade level of the student (required)',
  })
  @IsUUID()
  @IsNotEmpty()
  gradeId: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'When set, the student is enrolled into this classroom for the active semester',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;
}
