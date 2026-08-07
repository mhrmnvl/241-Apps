import { ApiProperty } from '@nestjs/swagger';
import { AgendaSummaryDto } from '../../../agenda/dto/response/agenda.dto.js';
import { AlbumSummaryDto } from '../../../gallery/dto/response/gallery.dto.js';
import { PostSummaryDto } from '../../../post/dto/response/post-detail.dto.js';

/**
 * What a section holds. The discriminator is on the section rather than on each
 * item, because a section is homogeneous by construction — "berita" never
 * contains an agenda entry — and putting it on every item would repeat the same
 * value across the payload.
 */
export type HomepageSectionKind = 'post' | 'agenda' | 'album';

export type HomepageItemDto =
  | PostSummaryDto
  | AgendaSummaryDto
  | AlbumSummaryDto;

export class HomepageSectionDto {
  @ApiProperty({ example: 'berita' }) key: string;
  @ApiProperty({ example: 1 }) displayOrder: number;

  @ApiProperty({
    enum: ['post', 'agenda', 'album'],
    description: 'Which shape `items` carries — the client renders per kind',
  })
  kind: HomepageSectionKind;

  @ApiProperty({
    type: [Object],
    description:
      'Empty when the section has nothing published yet — the page renders an empty state rather than breaking',
  })
  items: HomepageItemDto[];
}

export class HomepageResponseDto {
  @ApiProperty({ type: [HomepageSectionDto] })
  sections: HomepageSectionDto[];
}

export class HomepageSectionSettingDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() key: string;
  @ApiProperty() itemCount: number;
  @ApiProperty() isEnabled: boolean;
  @ApiProperty() displayOrder: number;
}
