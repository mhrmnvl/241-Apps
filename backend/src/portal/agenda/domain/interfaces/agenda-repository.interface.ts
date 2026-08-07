import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { ContentStatus } from '../../../post/domain/enums/content-status.enum.js';

export interface AgendaEntryRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  coverFileId: string | null;
  status: `${ContentStatus}`;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  authorId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateAgendaInput {
  title: string;
  slug: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  coverFileId?: string | null;
  authorId: string;
}

export interface UpdateAgendaInput {
  title?: string;
  slug?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  coverFileId?: string | null;
}

export interface AgendaQueryInput {
  page?: number;
  limit?: number;
  status?: `${ContentStatus}`;
  search?: string;
  includeDeleted?: boolean;
}

/**
 * Upcoming and past are read-time predicates, not stored flags (FR-040/041).
 *
 * `upcoming` is `[VISIBLE] AND endTime >= now()`, ordered by start ascending —
 * which is what keeps a multi-day entry in the upcoming list for its whole run
 * rather than dropping it the morning after it began.
 */
export type AgendaScope = 'upcoming' | 'past';

export interface PublicAgendaQueryInput {
  page?: number;
  limit?: number;
  scope: AgendaScope;
}

export abstract class IAgendaRepository {
  abstract findAll(
    query: AgendaQueryInput,
  ): Promise<PaginatedResult<AgendaEntryRow>>;

  abstract findById(id: string): Promise<AgendaEntryRow | null>;

  abstract findPublic(
    query: PublicAgendaQueryInput,
    now?: Date,
  ): Promise<PaginatedResult<AgendaEntryRow>>;

  abstract findPublicBySlug(
    slug: string,
    now?: Date,
  ): Promise<AgendaEntryRow | null>;

  /** Nearest upcoming entries, for the homepage section. */
  abstract findUpcoming(take: number, now?: Date): Promise<AgendaEntryRow[]>;

  abstract findTakenSlugs(prefix: string): Promise<string[]>;

  abstract create(data: CreateAgendaInput): Promise<AgendaEntryRow>;

  abstract update(
    id: string,
    expectedVersion: number,
    data: UpdateAgendaInput,
  ): Promise<AgendaEntryRow | null>;

  abstract publish(
    id: string,
    expectedVersion: number,
    status: `${ContentStatus}`,
    publishedAt: Date,
    scheduledAt: Date | null,
  ): Promise<AgendaEntryRow | null>;

  abstract unpublish(
    id: string,
    expectedVersion: number,
  ): Promise<AgendaEntryRow | null>;

  abstract archive(
    id: string,
    expectedVersion: number,
  ): Promise<AgendaEntryRow | null>;

  abstract softDelete(id: string): Promise<void>;

  abstract restore(id: string): Promise<AgendaEntryRow>;

  /** Visible entries, for the sitemap. */
  abstract findAllVisible(
    now?: Date,
  ): Promise<{ slug: string; updatedAt: Date }[]>;
}
