import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSemesterTypeDto {
  @ApiProperty({ example: 'ODD', description: 'Name of the semester type' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 1,
    description:
      'Term order within a year: Ganjil 1, Genap 2. Higher sorts later.',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  sequence?: number;

  @ApiProperty({ example: true, description: 'Is active?' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
