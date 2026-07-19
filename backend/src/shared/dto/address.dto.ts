import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Jl. Veteran No. 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street: string;

  @ApiProperty({ example: '001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  rt: string;

  @ApiProperty({ example: '002' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  rw: string;

  @ApiProperty({ example: 'Penanggungan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  village: string;

  @ApiProperty({ example: 'Klojen' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: 'Kota Malang' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Jawa Timur' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province: string;

  @ApiPropertyOptional({ example: 'Indonesia', default: 'Indonesia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: '65113' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  postalCode: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5)
  rt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5)
  rw?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  village?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class AddressResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ example: 'Jl. Veteran No. 1' })
  street: string;

  @ApiProperty({ example: '001' })
  rt: string;

  @ApiProperty({ example: '002' })
  rw: string;

  @ApiProperty({ example: 'Penanggungan' })
  village: string;

  @ApiProperty({ example: 'Klojen' })
  district: string;

  @ApiProperty({ example: 'Kota Malang' })
  city: string;

  @ApiProperty({ example: 'Jawa Timur' })
  province: string;

  @ApiProperty({ example: 'Indonesia' })
  country: string;

  @ApiProperty({ example: '65113' })
  postalCode: string;

  @ApiProperty({ example: false })
  isPrimary: boolean;
}
