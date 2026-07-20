import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({ description: 'Level number (e.g., 7, 8, 9)', example: 7 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(15)
  level: number;

  @ApiProperty({
    description: 'Level name (e.g., VII, VIII, IX)',
    example: 'VII',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
