import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestRevisionDto {
  @ApiProperty({ description: 'Revision note shown to the applicant' })
  @IsString()
  @IsNotEmpty()
  note: string;
}
