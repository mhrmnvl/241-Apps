import { ApiProperty } from '@nestjs/swagger';

export class SocialMediaResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440014' }) id!: string;
  @ApiProperty({ example: 'Instagram' }) name!: string;
  @ApiProperty({ example: 'https://instagram.com/' }) baseUrl!: string;
}

export class SocialMediaListResponseDto {
  @ApiProperty({ type: () => [SocialMediaResponseDto] })
  data!: SocialMediaResponseDto[];
  @ApiProperty({ example: { page: 1, limit: 10, total: 5, totalPages: 1 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
