import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Identifier (Username / NIS / NIP)',
  })
  @IsString()
  @IsNotEmpty({ message: 'identifier should not be empty' })
  identifier!: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @IsNotEmpty({ message: 'password should not be empty' })
  @MinLength(1)
  password!: string;
}
