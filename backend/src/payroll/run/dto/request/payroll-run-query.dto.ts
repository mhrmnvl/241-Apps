import { ApiPropertyOptional } from '@nestjs/swagger';
import { PayrollRunStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PayrollRunQueryDto {
  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ enum: PayrollRunStatus })
  @IsOptional()
  @IsEnum(PayrollRunStatus)
  status?: PayrollRunStatus;
}
