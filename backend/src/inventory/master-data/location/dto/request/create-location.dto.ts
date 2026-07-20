import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'LOC-A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Gedung Rektorat' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Gedung Utama', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  building?: string;

  @ApiProperty({ example: 'Ruang 301', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  room?: string;

  @ApiProperty({ example: 'Rak B', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  rack?: string;

  @ApiProperty({ example: 'Keterangan tambahan', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
