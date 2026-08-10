import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class NonWorkingDayQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
}
