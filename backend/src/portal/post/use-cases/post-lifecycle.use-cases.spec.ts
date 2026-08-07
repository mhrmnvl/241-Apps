import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostAuditService } from '../services/post-audit.service.js';
import { POST_AUDIT_ACTIONS } from '../constants/post.constants.js';
import { ArchivePostUseCase } from './archive-post.use-case.js';
import { DeletePostUseCase } from './delete-post.use-case.js';
import { PinPostUseCase } from './pin-post.use-case.js';
import { RestorePostUseCase } from './restore-post.use-case.js';
import { UnpublishPostUseCase } from './unpublish-post.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const ACTOR_ID = '99999999-9999-4999-8999-999999999999';
const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    type: PostType.BERITA,
    title: 'Juara 1 Olimpiade',
    slug: 'juara-1-olimpiade',
    summary: 'Ringkasan',
    body: '<p>Isi</p>',
    coverFileId: null,
    coverAltText: null,
    categoryId: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2026-08-01T00:00:00.000Z'),
    scheduledAt: null,
    expiresAt: null,
    attachmentFileId: null,
    pinnedAt: null,
    metaTitle: null,
    metaDescription: null,
    authorId: AUTHOR_ID,
    version: 3,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    deletedAt: null,
    author: { id: AUTHOR_ID, identifier: 'humas', profile: { name: 'Humas' } },
    category: null,
    coverFile: null,
    attachment: null,
    ...overrides,
  };
}

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

const repository = {
  findById: jest.fn(),
  unpublish: jest.fn(),
  archive: jest.fn(),
  pin: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
};

const audit = { record: jest.fn() };

async function build<T>(useCase: new (...args: never[]) => T): Promise<T> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      { provide: PortalCacheService, useValue: cacheMock },
      useCase,
      { provide: IPostRepository, useValue: repository },
      { provide: PostAuditService, useValue: audit },
    ],
  }).compile();
  return module.get(useCase);
}

beforeEach(() => {
  jest.clearAllMocks();
  repository.findById.mockResolvedValue(row());
  audit.record.mockResolvedValue(undefined);
});

describe('UnpublishPostUseCase', () => {
  let useCase: UnpublishPostUseCase;

  beforeEach(async () => {
    useCase = await build(UnpublishPostUseCase);
    repository.unpublish.mockResolvedValue(
      row({ status: ContentStatus.DRAFT, publishedAt: null, version: 4 }),
    );
  });

  // FR-017: withdrawing is not archiving. Clearing publishedAt is what makes a
  // later republish a fresh publication rather than a resurrection.
  it('returns the item with its publication date cleared', async () => {
    const result = await useCase.execute('post-1', { version: 3 }, ACTOR_ID);

    expect(result.status).toBe(ContentStatus.DRAFT);
    expect(result.publishedAt).toBeNull();
  });

  it('takes the version the editor loaded', async () => {
    await useCase.execute('post-1', { version: 3 }, ACTOR_ID);

    expect(repository.unpublish).toHaveBeenCalledWith('post-1', 3);
  });

  it('refuses when someone else saved first', async () => {
    repository.unpublish.mockResolvedValue(null);

    await expect(
      useCase.execute('post-1', { version: 3 }, ACTOR_ID),
    ).rejects.toThrow(ConflictException);
  });

  it('404s on an already-deleted item', async () => {
    repository.findById.mockResolvedValue(row({ deletedAt: new Date() }));

    await expect(
      useCase.execute('post-1', { version: 3 }, ACTOR_ID),
    ).rejects.toThrow(NotFoundException);
  });

  // FR-064 — the portal is the first module to write audit rows, so this is
  // asserted rather than assumed.
  it('records who took it down', async () => {
    await useCase.execute('post-1', { version: 3 }, ACTOR_ID);

    expect(audit.record).toHaveBeenCalledWith(
      POST_AUDIT_ACTIONS.UNPUBLISH,
      expect.objectContaining({ id: 'post-1' }),
      ACTOR_ID,
    );
  });

  it('does not record anything when the write was refused', async () => {
    repository.unpublish.mockResolvedValue(null);

    await expect(
      useCase.execute('post-1', { version: 3 }, ACTOR_ID),
    ).rejects.toThrow(ConflictException);
    expect(audit.record).not.toHaveBeenCalled();
  });
});

describe('ArchivePostUseCase', () => {
  let useCase: ArchivePostUseCase;

  beforeEach(async () => {
    useCase = await build(ArchivePostUseCase);
  });

  // Archiving is filing, not retraction — the date it went out survives.
  it('keeps the publication date', async () => {
    const publishedAt = new Date('2026-08-01T00:00:00.000Z');
    repository.archive.mockResolvedValue(
      row({ status: ContentStatus.ARCHIVED, publishedAt, version: 4 }),
    );

    const result = await useCase.execute('post-1', { version: 3 });

    expect(result.status).toBe(ContentStatus.ARCHIVED);
    expect(result.publishedAt).toEqual(publishedAt);
  });

  it('refuses on a version mismatch', async () => {
    repository.archive.mockResolvedValue(null);

    await expect(useCase.execute('post-1', { version: 1 })).rejects.toThrow(
      ConflictException,
    );
  });
});

describe('PinPostUseCase', () => {
  let useCase: PinPostUseCase;

  beforeEach(async () => {
    useCase = await build(PinPostUseCase);
    repository.pin.mockResolvedValue(row({ pinnedAt: new Date(), version: 4 }));
  });

  it('pins with a timestamp so several pinned items can order among themselves', async () => {
    await useCase.execute('post-1', { version: 3, pinned: true });

    const [, , pinnedAt] = repository.pin.mock.calls[0] as [
      string,
      number,
      Date | null,
    ];
    expect(pinnedAt).toBeInstanceOf(Date);
  });

  it('unpins by clearing the timestamp rather than storing a flag', async () => {
    repository.pin.mockResolvedValue(row({ pinnedAt: null, version: 4 }));

    await useCase.execute('post-1', { version: 3, pinned: false });

    expect(repository.pin).toHaveBeenCalledWith('post-1', 3, null);
  });
});

describe('DeletePostUseCase', () => {
  let useCase: DeletePostUseCase;

  beforeEach(async () => {
    useCase = await build(DeletePostUseCase);
    repository.softDelete.mockResolvedValue(row({ deletedAt: new Date() }));
  });

  it('soft deletes rather than removing the row', async () => {
    await useCase.execute('post-1', ACTOR_ID);

    expect(repository.softDelete).toHaveBeenCalledWith('post-1');
  });

  it('records who deleted it', async () => {
    await useCase.execute('post-1', ACTOR_ID);

    expect(audit.record).toHaveBeenCalledWith(
      POST_AUDIT_ACTIONS.DELETE,
      expect.objectContaining({ id: 'post-1' }),
      ACTOR_ID,
    );
  });

  it('404s rather than deleting twice', async () => {
    repository.findById.mockResolvedValue(row({ deletedAt: new Date() }));

    await expect(useCase.execute('post-1', ACTOR_ID)).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.softDelete).not.toHaveBeenCalled();
  });
});

describe('RestorePostUseCase', () => {
  let useCase: RestorePostUseCase;
  const NOW = new Date('2026-08-07T00:00:00.000Z');

  beforeEach(async () => {
    useCase = await build(RestorePostUseCase);
  });

  function deletedDaysAgo(days: number) {
    return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  }

  // FR-019: restore returns the item to the state it was deleted in, not to a
  // draft. Someone who deleted the wrong published article gets it back live.
  it('returns a deleted published item to PUBLISHED, not to DRAFT', async () => {
    repository.findById.mockResolvedValue(
      row({ deletedAt: deletedDaysAgo(2), status: ContentStatus.PUBLISHED }),
    );
    repository.restore.mockResolvedValue(
      row({ deletedAt: null, status: ContentStatus.PUBLISHED }),
    );

    const result = await useCase.execute('post-1', NOW);

    expect(result.status).toBe(ContentStatus.PUBLISHED);
    expect(result.deletedAt).toBeNull();
  });

  it('restores on the last day of the window', async () => {
    repository.findById.mockResolvedValue(
      row({ deletedAt: deletedDaysAgo(30) }),
    );
    repository.restore.mockResolvedValue(row({ deletedAt: null }));

    await expect(useCase.execute('post-1', NOW)).resolves.toBeDefined();
  });

  it('refuses past the 30-day window', async () => {
    repository.findById.mockResolvedValue(
      row({ deletedAt: deletedDaysAgo(31) }),
    );

    await expect(useCase.execute('post-1', NOW)).rejects.toThrow(
      BadRequestException,
    );
    expect(repository.restore).not.toHaveBeenCalled();
  });

  it('refuses an item that was never deleted', async () => {
    repository.findById.mockResolvedValue(row({ deletedAt: null }));

    await expect(useCase.execute('post-1', NOW)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('404s on an id that does not exist at all', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('post-1', NOW)).rejects.toThrow(
      NotFoundException,
    );
  });
});
