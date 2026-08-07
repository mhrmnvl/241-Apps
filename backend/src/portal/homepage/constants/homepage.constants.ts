import { PostType } from '../../post/domain/enums/post-type.enum.js';

export const HOMEPAGE_SECTION_KEYS = {
  BERITA: 'berita',
  AGENDA: 'agenda',
  PENGUMUMAN: 'pengumuman',
  GALERI: 'galeri',
} as const;

/**
 * Sections the post module can fill. Agenda and Galeri have their own modules
 * (US9, US11) and resolve to an empty list until those land — which renders the
 * section's empty state rather than breaking the page (FR-031).
 */
export const POST_BACKED_SECTIONS: Record<string, `${PostType}`> = {
  [HOMEPAGE_SECTION_KEYS.BERITA]: PostType.BERITA,
  [HOMEPAGE_SECTION_KEYS.PENGUMUMAN]: PostType.PENGUMUMAN,
};

export const MIN_SECTION_ITEMS = 1;
export const MAX_SECTION_ITEMS = 12;
