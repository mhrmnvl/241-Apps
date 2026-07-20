import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UploadPaymentProofDto {
  @ApiProperty({ example: 'BSI' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;

  @ApiProperty({ example: 'Ahmad Fauzi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  senderAccountName: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  transferDate?: string;
}
