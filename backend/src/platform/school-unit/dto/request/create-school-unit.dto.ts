import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SchoolUnitStatus } from '../../../../shared/domain/enums/school-unit-status.enum.js';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSchoolUnitDto {
  @ApiProperty({ example: 'MTs Negeri 1 Kota Malang' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'MTsN 1 Malang' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  surname: string;

  @ApiProperty({ example: '121235730001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nsm: string;

  @ApiProperty({ example: '20518057' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  npsn: string;

  @ApiProperty({ enum: SchoolUnitStatus, example: 'PUBLIC' })
  @IsEnum(SchoolUnitStatus)
  status: SchoolUnitStatus;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  @IsString()
  @IsOptional()
  typeId?: string;

  @ApiProperty({ example: '01.234.567.8-901.000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  npwp: string;

  @ApiProperty({ example: '0341123456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;

  @ApiProperty({ example: 'info@mtsn1malang.sch.id' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'https://mtsn1malang.sch.id' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  website: string;

  @ApiPropertyOptional({
    example: -6.914744,
    description:
      'WGS84 latitude of the school, -90 to 90. Null clears the pin.',
  })
  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latitude?: number | null;

  @ApiPropertyOptional({
    example: 107.60981,
    description:
      'WGS84 longitude of the school, -180 to 180. Null clears the pin.',
  })
  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  longitude?: number | null;
}
