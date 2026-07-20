import { ApiPropertyOptional } from '@nestjs/swagger';
import { MaritalStatus, UserGender } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ahmad Fauzi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '3578010101080001' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  nik?: string;

  @ApiPropertyOptional({ enum: UserGender })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @ApiPropertyOptional({ example: 'Malang' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  birthPlace?: string;

  @ApiPropertyOptional({ example: '2008-01-01' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'ahmad.fauzi@email.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @ApiPropertyOptional({ example: 'religion-uuid', description: 'Agama ID' })
  @IsOptional()
  @IsString()
  religionId?: string;

  @ApiPropertyOptional({
    example: 'blood-type-uuid',
    description: 'Golongan Darah ID',
  })
  @IsOptional()
  @IsString()
  bloodTypeId?: string;

  @ApiPropertyOptional({
    enum: MaritalStatus,
    description: 'Status Pernikahan',
  })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({
    example: '3578010101080001',
    description: 'No. KK (16 digit)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  noKk?: string;

  @ApiPropertyOptional({ example: '12.345.678.9-012.000', description: 'NPWP' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  npwp?: string;
}
