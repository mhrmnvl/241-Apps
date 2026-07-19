import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DropStudentDto {
  @ApiPropertyOptional({ description: 'Reason for dropping the enrollment' })
  @IsOptional()
  @IsString()
  note?: string;
}
