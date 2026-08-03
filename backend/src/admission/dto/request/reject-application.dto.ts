import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectApplicationDto {
  @ApiProperty({ description: 'Alasan penolakan' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
