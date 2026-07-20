import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePositionCategoryDto {
  @ApiProperty({ example: 'MANAGEMENT' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @ApiProperty({ example: 'Management' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
