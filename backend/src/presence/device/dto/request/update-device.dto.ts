import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateDeviceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @ApiPropertyOptional({
    description: 'Deactivating refuses the token immediately',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
