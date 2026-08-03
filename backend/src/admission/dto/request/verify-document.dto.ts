import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { AdmissionDocumentStatus } from '../../../shared/domain/enums/admission-document-status.enum.js';

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
