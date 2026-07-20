import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSchoolUnitSocialMediaDto {
  @ApiProperty({
    description: 'Platform ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440014',
  })
  @IsUUID()
  @IsNotEmpty()
  socialMediaId: string;

  @ApiPropertyOptional({ example: '@mtsn1malang' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/mtsn1malang' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;
}

export class UpdateSchoolUnitSocialMediaDto extends PartialType(
  CreateSchoolUnitSocialMediaDto,
) {}
