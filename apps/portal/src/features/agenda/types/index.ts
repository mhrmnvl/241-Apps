import type { ContentStatus } from '@/features/post'

export interface AgendaEntry {
  id: string
  title: string
  slug: string
  description: string
  startTime: string
  endTime: string
  location: string
  coverFileId: string | null
  coverImageUrl: string | null
  status: ContentStatus
  publishedAt: string | null
  scheduledAt: string | null
  authorId: string
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** What a visitor receives — no editorial state. */
export interface PublicAgendaEntry {
  id: string
  title: string
  slug: string
  description: string
  startTime: string
  endTime: string
  location: string
  coverImageUrl: string | null
  publishedAt: string
}

export interface CreateAgendaPayload {
  title: string
  slug?: string
  description: string
  startTime: string
  endTime: string
  location: string
  coverFileId?: string
}

export type UpdateAgendaPayload = Partial<CreateAgendaPayload> & {
  version: number
}

export type AgendaScope = 'upcoming' | 'past'

export interface PublicAgendaQuery {
  scope?: AgendaScope
  page?: number
  limit?: number
}
