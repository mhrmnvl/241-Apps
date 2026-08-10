import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateWorkPatternDto {
  @ApiProperty({ example: 'Piket' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 10, description: 'Lateness is counted beyond this' })
  @IsInt()
  @Min(0)
  @Max(120)
  graceMinutes!: number;

  @ApiPropertyOptional({ description: 'Applies to anyone with no assignment' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
