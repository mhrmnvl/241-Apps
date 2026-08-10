import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RevokeCredentialDto {
  @ApiProperty({ example: 'Kartu hilang' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  reason!: string;
}
