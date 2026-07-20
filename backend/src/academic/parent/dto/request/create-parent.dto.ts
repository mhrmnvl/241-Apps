import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncomeRange } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateParentDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '3578010101700001' })
  @IsString()
  @IsNotEmpty()
  @Length(16, 16)
  nik: string;

  @ApiProperty({ example: 'Surabaya' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  birthPlace: string;

  @ApiProperty({ example: '1970-01-01' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: 'budi.santoso@email.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '082345678901' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone?: string;

  @ApiProperty({
    description: 'Occupation ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440012',
  })
  @IsUUID()
  occupationId: string;

  @ApiPropertyOptional({
    enum: IncomeRange,
    description: 'Parent income range',
  })
  @IsOptional()
  @IsEnum(IncomeRange)
  income?: IncomeRange;
}
