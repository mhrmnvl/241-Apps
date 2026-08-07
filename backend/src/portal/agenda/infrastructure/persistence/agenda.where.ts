import { ContentStatus, Prisma } from '@prisma/client';
import { AgendaScope } from '../../domain/interfaces/agenda-repository.interface.js';

/**
 * The same visibility rule the rest of the portal uses, expressed for this
 * model. See `page.where.ts` for why the rule is shared but each expression of
 * it is per-model.
 */
export function visibleAgendaWhere(
  now: Date = new Date(),
): Prisma.AgendaEntryWhereInput {
  return {
    deletedAt: null,
    status: { in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED] },
    publishedAt: { not: null, lte: now },
  };
}

/**
 * Upcoming vs past, as a read-time predicate rather than a stored flag
 * (FR-040/041).
 *
 * **Keyed on `endTime`, not `startTime`** — and that is the whole reason this
 * function exists. An entry running 30 December to 2 January is happening for
 * its entire run; comparing on `startTime` would move it into "past" on the
 * 31st, while people were still attending it.
 */
export function agendaScopeWhere(
  scope: AgendaScope,
  now: Date = new Date(),
): Prisma.AgendaEntryWhereInput {
  return {
    ...visibleAgendaWhere(now),
    endTime: scope === 'upcoming' ? { gte: now } : { lt: now },
  };
}

/** Nearest first while it is still to come; most recent first once it is over. */
export function agendaScopeOrder(
  scope: AgendaScope,
): Prisma.AgendaEntryOrderByWithRelationInput[] {
  return scope === 'upcoming'
    ? [{ startTime: 'asc' }]
    : [{ startTime: 'desc' }];
}

export function buildAdminAgendaWhere(query: {
  status?: string;
  search?: string;
  includeDeleted?: boolean;
}): Prisma.AgendaEntryWhereInput {
  const { status, search, includeDeleted } = query;

  return {
    ...(includeDeleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(status && { status: status as ContentStatus }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };
}
