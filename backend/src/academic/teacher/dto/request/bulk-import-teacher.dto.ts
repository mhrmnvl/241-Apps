import { UserGender } from '../../../../shared/domain/enums/user-gender.enum.js';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
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
  @Matches(/^[0-9+]+$/, {
    message: 'phone must contain only numbers or +',
  })
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
