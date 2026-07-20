import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateEmploymentTypeDto {
  @ApiProperty({ example: 'Civil Servant Update', required: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;
}
