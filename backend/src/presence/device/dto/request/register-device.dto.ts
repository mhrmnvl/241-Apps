import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty({ example: 'Gerbang Utama' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Depan, dekat pos satpam' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;
}
