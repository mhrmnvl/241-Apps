import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AdmissionDocumentStatus,
  AdmissionPaymentStatus,
} from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class RequestRevisionDto {
  @ApiProperty({ description: 'Catatan revisi untuk pendaftar' })
  @IsString()
  @IsNotEmpty()
  note: string;
}

export class AcceptApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class RejectApplicationDto {
  @ApiProperty({ description: 'Alasan penolakan' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class VerifyDocumentDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(AdmissionDocumentStatus)
  @IsIn(['APPROVED', 'REJECTED'])
  status: AdmissionDocumentStatus;

  @ApiPropertyOptional({ description: 'Wajib diisi jika REJECTED' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ enum: ['VERIFIED', 'REJECTED'] })
  @IsEnum(AdmissionPaymentStatus)
  @IsIn(['VERIFIED', 'REJECTED'])
  status: AdmissionPaymentStatus;

  @ApiPropertyOptional({ description: 'Wajib diisi jika REJECTED' })
  @IsOptional()
  @IsString()
  note?: string;
}

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

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  gradeId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Jika diisi, siswa langsung didaftarkan ke kelas ini pada semester aktif',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;
}
