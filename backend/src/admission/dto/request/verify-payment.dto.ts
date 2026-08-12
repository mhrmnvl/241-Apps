import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { AdmissionPaymentStatus } from '../../../shared/domain/enums/admission-payment-status.enum.js';

export class VerifyPaymentDto {
  @ApiProperty({ enum: ['VERIFIED', 'REJECTED'] })
  @IsEnum(AdmissionPaymentStatus)
  @IsIn(['VERIFIED', 'REJECTED'])
  status: AdmissionPaymentStatus;

  @ApiPropertyOptional({
    description: 'Required when the decision is REJECTED',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
