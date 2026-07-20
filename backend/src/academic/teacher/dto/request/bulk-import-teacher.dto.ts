import { UserGender } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class BulkImportTeacherRowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  identifier: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  nik: string;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  birthPlace: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nip?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nuptk?: string;

  @IsString()
  @IsNotEmpty()
  employmentTypeCode: string;
}
