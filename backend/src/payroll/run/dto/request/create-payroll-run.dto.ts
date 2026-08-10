import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayrollRunKind } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePayrollRunDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @ApiProperty({ example: 7, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiPropertyOptional({
    enum: PayrollRunKind,
    default: PayrollRunKind.ORIGINAL,
  })
  @IsOptional()
  @IsEnum(PayrollRunKind)
  kind?: PayrollRunKind;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
