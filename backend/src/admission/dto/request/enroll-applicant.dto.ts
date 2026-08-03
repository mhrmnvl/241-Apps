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

  @ApiProperty({ format: 'uuid', description: 'Tingkat kelas siswa (wajib)' })
  @IsUUID()
  @IsNotEmpty()
  gradeId: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Jika diisi, siswa langsung didaftarkan ke kelas ini pada semester aktif',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;
}
