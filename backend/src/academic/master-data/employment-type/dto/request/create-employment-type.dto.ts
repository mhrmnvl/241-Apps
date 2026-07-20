import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEmploymentTypeDto {
  @ApiProperty({ example: 'PNS' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Civil Servant' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
