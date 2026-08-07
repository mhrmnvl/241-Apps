import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Everything the HTML-serving layer needs to fill in a link preview card.
 *
 * Consumed by the backend's own `portal-html.controller.ts` rather than by a
 * browser: WhatsApp and Facebook do not run JavaScript, so the tags have to be
 * in the HTML before it leaves the server (research R3).
 */
export class PageMetaDto {
  @ApiProperty() title: string;
  @ApiProperty() description: string;

  @ApiProperty({ description: 'Absolute address this content lives at' })
  canonicalUrl: string;

  @ApiPropertyOptional({
    description:
      'Always a /portal/public/media/:id?variant=preview address, never a signed URL — a crawler caches what it is given, and an expiring URL becomes a dead image in every card already shared',
  })
  imageUrl: string | null;

  @ApiProperty({ enum: ['website', 'article'] })
  type: 'website' | 'article';

  @ApiPropertyOptional() publishedAt: Date | null;
}

export class SitemapEntryDto {
  @ApiProperty({ example: '/berita/juara-1-olimpiade' }) path: string;
  @ApiProperty() lastModified: Date;
}
