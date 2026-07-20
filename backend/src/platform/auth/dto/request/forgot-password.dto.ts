import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Username, Email, atau NIS/NIP user' })
  @IsNotEmpty()
  @IsString()
  identifier!: string;
}
