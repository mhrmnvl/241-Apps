import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AlbumSummaryDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiPropertyOptional() description: string | null;

  @ApiProperty({
    description: 'When the activity happened, not when the album was published',
  })
  eventDate: Date;

  @ApiPropertyOptional({
    description: 'Stable public media address, never a signed URL',
  })
  coverImageUrl: string | null;

  @ApiProperty({ description: 'How many photos the album holds' })
  photoCount: number;

  @ApiProperty() publishedAt: Date;
}

export class GalleryPhotoDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ description: 'Stable public media address' }) imageUrl: string;
  @ApiPropertyOptional() caption: string | null;
  @ApiProperty({ description: 'Required on every photo (FR-057)' })
  altText: string;
  @ApiProperty() displayOrder: number;
}
