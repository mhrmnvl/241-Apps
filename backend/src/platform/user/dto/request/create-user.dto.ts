import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'admin01', minLength: 3, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  identifier: string;

  @ApiProperty({ example: 'password123', minLength: 6, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
