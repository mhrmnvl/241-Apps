import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileSocialMediaResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440015' }) id!: string;
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440015',
    description: 'Platform UUID',
  })
  socialMediaId!: string;
  @ApiPropertyOptional({ example: 'ahmad_fauzi' }) username!: string | null;
}

export class ProfileSocialMediaListDto extends ProfileSocialMediaResponseDto {
  @ApiProperty({ example: 'Instagram' }) platformName!: string;
  @ApiProperty({ example: 'https://instagram.com/' }) platformBaseUrl!: string;
  @ApiProperty({ example: 'STUDENT' })
  profileRole!: string;
  @ApiProperty({ example: 'Ahmad Fauzi' }) profileName!: string;
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440015' })
  profileId!: string;
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440015' })
  userId!: string;
}

export class ProfileSocialMediaListResponseDto {
  @ApiProperty({ type: [ProfileSocialMediaListDto] })
  data!: ProfileSocialMediaListDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 50, totalPages: 5 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
