import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateSocialMediaDto {
  @ApiProperty({ example: 'Instagram' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'https://instagram.com/' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @MaxLength(255)
  baseUrl: string;
}
