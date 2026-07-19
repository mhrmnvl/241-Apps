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

export class CreateStudentDto {
  @ApiPropertyOptional({
    example: 'siswa001',
    description: 'Auto-uses NIS if empty',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  identifier?: string;

  @ApiPropertyOptional({
    example: 'P@ssw0rd!',
    description: 'Auto-uses NIS if empty',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @ApiProperty({ example: 'Ahmad Fauzi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '3578010101080001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  nik: string;

  @ApiProperty({ enum: UserGender, example: 'MALE' })
  @IsEnum(UserGender)
  gender: UserGender;

  @ApiProperty({ example: 'Malang' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  birthPlace: string;

  @ApiProperty({ example: '2008-01-01' })
  @IsDateString()
  birthDate: string;

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

  @ApiPropertyOptional({
    description: 'Classroom Level ID (UUID)',
  })
  @IsOptional()
  @IsUUID()
  gradeId?: string;

  @ApiPropertyOptional({
    description: 'Class ID — for auto-enrollment to the active semester',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @ApiProperty({ example: '2024001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nis: string;

  @ApiProperty({ example: '0012345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nisn: string;
}
