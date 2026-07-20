import { UserGender } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class BulkImportStudentRowDto {
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
  @IsNumber()
  grade?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  classroomCode?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nis: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nisn: string;
}
