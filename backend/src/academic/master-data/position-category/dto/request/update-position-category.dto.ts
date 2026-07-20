import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePositionCategoryDto {
  @ApiProperty({ example: 'Management Updated', required: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;
}
