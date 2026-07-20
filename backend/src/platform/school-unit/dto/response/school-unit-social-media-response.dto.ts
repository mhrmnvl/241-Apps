import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SchoolUnitSocialMediaResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440011' })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440011',
    description: 'Platform UUID',
  })
  socialMediaId!: string;

  @ApiPropertyOptional({ example: 'mtsn1malang' })
  username!: string | null;

  @ApiPropertyOptional({ example: 'https://instagram.com/mtsn1malang' })
  url!: string | null;
}
