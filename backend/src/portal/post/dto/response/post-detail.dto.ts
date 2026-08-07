import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '../../domain/enums/post-type.enum.js';

/**
 * What an anonymous visitor receives.
 *
 * Deliberately narrower than the admin shape: no status, no version, no
 * scheduledAt, no authorId — a public payload should not describe the editorial
 * process, and `status` in particular would tell a scraper which items are
 * scheduled.
 */
export class PostDetailDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ enum: PostType }) type: `${PostType}`;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty() summary: string;
  @ApiProperty({ description: 'Sanitized HTML' }) body: string;

  @ApiPropertyOptional({
    description: 'Stable public media address, never a signed URL',
    example: '/portal/public/media/2f1c…',
  })
  coverImageUrl: string | null;

  @ApiPropertyOptional() coverAltText: string | null;

  @ApiPropertyOptional({ type: Object })
  category: { id: string; name: string; slug: string } | null;

  @ApiProperty({ description: 'Attribution survives the author deactivating' })
  authorName: string;

  @ApiProperty() publishedAt: Date;
  @ApiProperty() updatedAt: Date;

  @ApiPropertyOptional({ description: 'PENGUMUMAN only' })
  expiresAt: Date | null;

  @ApiPropertyOptional({ description: 'PENGUMUMAN only, public download' })
  attachmentUrl: string | null;

  @ApiProperty() metaTitle: string;
  @ApiProperty() metaDescription: string;

  @ApiProperty({ type: [Object], description: 'Free-form labels (FR-038)' })
  tags: { id: string; name: string; slug: string }[];
}

export class PostSummaryDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ enum: PostType }) type: `${PostType}`;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty() summary: string;
  @ApiPropertyOptional() coverImageUrl: string | null;
  @ApiPropertyOptional() coverAltText: string | null;
  @ApiPropertyOptional({ type: Object })
  category: { id: string; name: string; slug: string } | null;
  @ApiProperty() authorName: string;
  @ApiProperty() publishedAt: Date;
  @ApiProperty({ description: 'Pinned items lead the listing' })
  isPinned: boolean;

  @ApiProperty({ type: [Object] })
  tags: { id: string; name: string; slug: string }[];
}
