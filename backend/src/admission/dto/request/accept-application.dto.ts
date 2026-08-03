import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AcceptApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
