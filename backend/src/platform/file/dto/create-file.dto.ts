import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFileDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originalName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty()
  @IsNotEmpty()
  sizeBytes!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  storageKey!: string;
}
