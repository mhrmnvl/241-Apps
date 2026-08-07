import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * What an anonymous visitor receives for one agenda entry.
 *
 * No status, no version, no authorId — same reasoning as `PostSummaryDto`: a
 * public payload should not describe the editorial process.
 */
export class AgendaSummaryDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty({ description: 'Sanitized HTML' }) description: string;
  @ApiProperty() startTime: Date;
  @ApiProperty() endTime: Date;
  @ApiProperty() location: string;

  @ApiPropertyOptional({
    description: 'Stable public media address, never a signed URL',
  })
  coverImageUrl: string | null;

  @ApiProperty() publishedAt: Date;
}
