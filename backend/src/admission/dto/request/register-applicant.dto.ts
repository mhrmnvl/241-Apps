import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterApplicantDto {
  @ApiProperty({ example: 'Ahmad Fauzi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'ahmad@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  passwordConfirm: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  waveId: string;
}
