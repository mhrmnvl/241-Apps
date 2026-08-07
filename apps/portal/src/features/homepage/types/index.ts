import type { PublicAgendaEntry } from '@/features/agenda'
import type { PostSummary } from '@/features/post/types'

/**
 * A section is homogeneous by construction — "berita" never holds an agenda
 * entry — so the discriminator sits on the section rather than on every item,
 * matching the API. `kind` is what tells the view which card to render.
 */
export type HomepageSectionKind = 'post' | 'agenda' | 'album'

export interface HomepageSection {
  key: string
  displayOrder: number
  kind: HomepageSectionKind
  items: (PostSummary | PublicAgendaEntry)[]
}

export interface HomepageResponse {
  sections: HomepageSection[]
}

export interface HomepageSectionSetting {
  id: string
  key: string
  itemCount: number
  isEnabled: boolean
  displayOrder: number
}

export type UpdateHomepageSectionPayload = Partial<
  Pick<HomepageSectionSetting, 'itemCount' | 'isEnabled' | 'displayOrder'>
>

export const SECTION_TITLES: Record<string, string> = {
  berita: 'Berita Terbaru',
  agenda: 'Agenda Terdekat',
  pengumuman: 'Pengumuman',
  galeri: 'Galeri',
}

/** Which public listing a section's "lihat semua" link points at. */
export const SECTION_LINKS: Record<string, string> = {
  berita: '/berita',
  agenda: '/agenda',
  pengumuman: '/pengumuman',
  galeri: '/galeri',
}
