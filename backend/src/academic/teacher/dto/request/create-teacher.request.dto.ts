import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTeacherDto {
  @ApiPropertyOptional({
    example: 'guru001',
    description: 'Jika kosong, otomatis menggunakan NIP/NUPTK/NIK',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  identifier?: string;

  @ApiPropertyOptional({
    example: 'P@ssw0rd!',
    description: 'Jika kosong, otomatis menggunakan NIP/NUPTK/NIK',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '3578010101700001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  nik: string;

  @ApiProperty({ enum: UserGender, example: 'MALE' })
  @IsEnum(UserGender)
  gender: UserGender;

  @ApiProperty({ example: 'Surabaya' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  birthPlace: string;

  @ApiProperty({ example: '1980-06-15' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: 'budi.santoso@email.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '081298765432' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @ApiPropertyOptional({ example: '198006152005011001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nip?: string;

  @ApiPropertyOptional({ example: '1234567890123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nuptk?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440007' })
  @IsUUID()
  @IsNotEmpty()
  employmentTypeId: string;
}
