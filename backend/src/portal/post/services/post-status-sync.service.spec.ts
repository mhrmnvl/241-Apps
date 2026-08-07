import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { visiblePostWhere } from '../infrastructure/persistence/post.where.js';
import { PostStatusSyncService } from './post-status-sync.service.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('PostStatusSyncService', () => {
  let service: PostStatusSyncService;
  const repository = { normalizeDueScheduled: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        PostStatusSyncService,
        { provide: IPostRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(PostStatusSyncService);
    jest.clearAllMocks();
    repository.normalizeDueScheduled.mockResolvedValue(0);
  });

  it('relabels due scheduled rows', async () => {
    repository.normalizeDueScheduled.mockResolvedValue(3);

    await service.normalizeDueScheduled();

    expect(repository.normalizeDueScheduled).toHaveBeenCalledTimes(1);
  });

  /**
   * The claim the docblock makes, asserted rather than trusted: this job is
   * cosmetic. Visibility already admits SCHEDULED rows whose moment has passed,
   * so an item goes public on time whether or not this ever runs (research R1).
   *
   * If someone ever narrows `visiblePostWhere` to PUBLISHED only, this fails —
   * which is the point. That change would make scheduled publishing depend on a
   * cron, and a missed tick would mean the school's announcement silently
   * failing to appear.
   */
  it('is not what makes a due scheduled item public', () => {
    const where = visiblePostWhere(new Date('2026-08-07T00:00:00.000Z'));

    expect(where.status).toEqual({
      in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED],
    });
  });

  // A failure costs a stale label until the next minute. It must not take the
  // process down, and nothing public is wrong in the meantime.
  it('swallows a repository failure rather than crashing the scheduler', async () => {
    repository.normalizeDueScheduled.mockRejectedValue(
      new Error('connection reset'),
    );

    await expect(service.normalizeDueScheduled()).resolves.toBeUndefined();
  });
});
