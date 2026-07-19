import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSemesterTypeDto {
  @ApiProperty({ example: 'ODD', description: 'Name of the semester type' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: true, description: 'Is active?' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
