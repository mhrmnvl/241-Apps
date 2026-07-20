import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEducationDto {
  @ApiProperty({
    description: 'Name of the education level',
    example: 'S1',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Whether this education level is currently active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
