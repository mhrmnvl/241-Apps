import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatus } from '../../post/domain/enums/content-status.enum.js';
import { IAgendaRepository } from '../domain/interfaces/agenda-repository.interface.js';
import {
  agendaScopeOrder,
  agendaScopeWhere,
} from '../infrastructure/persistence/agenda.where.js';
import {
  GetPublicAgendaBySlugUseCase,
  GetPublicAgendaUseCase,
} from './get-public-agenda.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';

function entry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'agenda-1',
    title: 'Pentas Seni Akhir Tahun',
    slug: 'pentas-seni-akhir-tahun',
    description: '<p>Acara</p>',
    startTime: new Date('2026-12-20T01:00:00.000Z'),
    endTime: new Date('2026-12-20T05:00:00.000Z'),
    location: 'Aula',
    coverFileId: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2026-08-01T00:00:00.000Z'),
    scheduledAt: null,
    authorId: AUTHOR_ID,
    version: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('GetPublicAgendaUseCase', () => {
  let useCase: GetPublicAgendaUseCase;
  const repository = { findPublic: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetPublicAgendaUseCase,
        { provide: IAgendaRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(GetPublicAgendaUseCase);
    jest.clearAllMocks();
    repository.findPublic.mockResolvedValue({
      data: [entry()],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  it('defaults to upcoming', async () => {
    await useCase.execute({});

    expect(repository.findPublic).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'upcoming' }),
    );
  });

  it('passes the past scope through when asked', async () => {
    await useCase.execute({ scope: 'past' });

    expect(repository.findPublic).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'past' }),
    );
  });

  it('exposes only the public shape', async () => {
    const [item] = (await useCase.execute({})).data as Record<
      string,
      unknown
    >[];

    expect(item).not.toHaveProperty('status');
    expect(item).not.toHaveProperty('version');
    expect(item).not.toHaveProperty('authorId');
  });

  it('returns the paginated envelope the interceptor expects', async () => {
    const result = await useCase.execute({});

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });
});

/**
 * The predicate itself, tested directly.
 *
 * These are the rules the use case delegates to, and they are where the
 * behaviour actually lives — asserting them through a mocked repository would
 * only prove the mock returns what it was told to.
 */
describe('the upcoming/past predicate', () => {
  const NOW = new Date('2026-12-31T12:00:00.000Z');

  it('composes the visibility rule rather than restating it', () => {
    const where = agendaScopeWhere('upcoming', NOW);

    expect(where.deletedAt).toBeNull();
    expect(where.status).toEqual({
      in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED],
    });
    expect(where.publishedAt).toEqual({ not: null, lte: NOW });
  });

  /**
   * The 30-December-to-2-January case, and the reason the predicate keys on
   * `endTime` rather than `startTime`.
   *
   * An entry running over the new year is *happening* on the 31st. Comparing on
   * start time would move it into "past" that morning, taking it off the
   * homepage while people were still attending it.
   */
  it('keeps a multi-day entry upcoming for its whole run', () => {
    const upcoming = agendaScopeWhere('upcoming', NOW);
    const past = agendaScopeWhere('past', NOW);

    expect(upcoming.endTime).toEqual({ gte: NOW });
    expect(past.endTime).toEqual({ lt: NOW });

    // Neither scope looks at startTime at all — which is the whole point.
    expect(upcoming.startTime).toBeUndefined();
    expect(past.startTime).toBeUndefined();
  });

  it('orders upcoming nearest-first and past most-recent-first', () => {
    expect(agendaScopeOrder('upcoming')).toEqual([{ startTime: 'asc' }]);
    expect(agendaScopeOrder('past')).toEqual([{ startTime: 'desc' }]);
  });

  it('never widens visibility, whichever scope is asked for', () => {
    for (const scope of ['upcoming', 'past'] as const) {
      const where = agendaScopeWhere(scope, NOW);
      expect(where.deletedAt).toBeNull();
      expect(where.publishedAt).toEqual({ not: null, lte: NOW });
    }
  });
});

describe('GetPublicAgendaBySlugUseCase', () => {
  let useCase: GetPublicAgendaBySlugUseCase;
  const repository = { findPublicBySlug: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetPublicAgendaBySlugUseCase,
        { provide: IAgendaRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(GetPublicAgendaBySlugUseCase);
    jest.clearAllMocks();
  });

  // A link shared before the event still works after it — the detail endpoint
  // is scope-free on purpose.
  it('returns an entry that has already happened', async () => {
    repository.findPublicBySlug.mockResolvedValue(
      entry({
        startTime: new Date('2020-01-01T00:00:00.000Z'),
        endTime: new Date('2020-01-01T02:00:00.000Z'),
      }),
    );

    const result = await useCase.execute('pentas-seni-akhir-tahun');

    expect(result.title).toBe('Pentas Seni Akhir Tahun');
  });

  it('404s on a draft, exactly as it would on an unknown address', async () => {
    repository.findPublicBySlug.mockResolvedValue(null);

    await expect(useCase.execute('masih-draft')).rejects.toThrow(
      NotFoundException,
    );
  });
});
