import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '../../domain/enums/content-status.enum.js';
import { PostType } from '../../domain/enums/post-type.enum.js';

/** What the management area receives — the editorial state included. */
export class PostAdminDetailDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ enum: PostType }) type: `${PostType}`;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty() summary: string;
  @ApiProperty() body: string;

  @ApiPropertyOptional({ format: 'uuid' }) coverFileId: string | null;
  @ApiPropertyOptional() coverAltText: string | null;
  @ApiPropertyOptional() coverImageUrl: string | null;

  @ApiPropertyOptional({ type: Object })
  category: { id: string; name: string; slug: string } | null;

  @ApiProperty({ enum: ContentStatus }) status: `${ContentStatus}`;
  @ApiPropertyOptional() publishedAt: Date | null;
  @ApiPropertyOptional() scheduledAt: Date | null;
  @ApiPropertyOptional() expiresAt: Date | null;
  @ApiPropertyOptional({ format: 'uuid' }) attachmentFileId: string | null;
  @ApiPropertyOptional() pinnedAt: Date | null;

  @ApiPropertyOptional() metaTitle: string | null;
  @ApiPropertyOptional() metaDescription: string | null;

  @ApiProperty({ type: [Object] })
  tags: { id: string; name: string; slug: string }[];

  @ApiProperty({ format: 'uuid' }) authorId: string;
  @ApiProperty() authorName: string;

  @ApiProperty({ description: 'Send this back on update; a mismatch is a 409' })
  version: number;

  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiPropertyOptional() deletedAt: Date | null;
}

export class PostAdminSummaryDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ enum: PostType }) type: `${PostType}`;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty({ enum: ContentStatus }) status: `${ContentStatus}`;
  @ApiPropertyOptional({ type: Object })
  category: { id: string; name: string; slug: string } | null;
  @ApiProperty() authorName: string;
  @ApiPropertyOptional() publishedAt: Date | null;
  @ApiPropertyOptional() pinnedAt: Date | null;
  @ApiProperty() version: number;
  @ApiProperty() updatedAt: Date;
  @ApiPropertyOptional() deletedAt: Date | null;
}
