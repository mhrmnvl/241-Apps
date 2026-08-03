import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestRevisionDto {
  @ApiProperty({ description: 'Catatan revisi untuk pendaftar' })
  @IsString()
  @IsNotEmpty()
  note: string;
}
