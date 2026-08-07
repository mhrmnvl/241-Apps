import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostAuditService } from '../services/post-audit.service.js';
import { POST_AUDIT_ACTIONS } from '../constants/post.constants.js';
import { PublishPostUseCase } from './publish-post.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';
const COVER_ID = '22222222-2222-4222-8222-222222222222';
const CATEGORY_ID = '33333333-3333-4333-8333-333333333333';

/** A draft with everything FR-012 requires. */
function publishable(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    type: PostType.BERITA,
    title: 'Juara 1 Olimpiade',
    slug: 'juara-1-olimpiade',
    summary: 'Ringkasan',
    body: '<p>Isi</p>',
    coverFileId: COVER_ID,
    coverAltText: 'Penyerahan piala',
    categoryId: CATEGORY_ID,
    status: ContentStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
    expiresAt: null,
    attachmentFileId: null,
    pinnedAt: null,
    metaTitle: null,
    metaDescription: null,
    authorId: AUTHOR_ID,
    version: 2,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    deletedAt: null,
    author: { id: AUTHOR_ID, identifier: 'humas', profile: { name: 'Humas' } },
    category: { id: CATEGORY_ID, name: 'Prestasi', slug: 'prestasi' },
    coverFile: null,
    attachment: null,
    ...overrides,
  };
}

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('PublishPostUseCase', () => {
  let useCase: PublishPostUseCase;

  const mockRepository = { findById: jest.fn(), publish: jest.fn() };
  const mockAudit = { record: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        PublishPostUseCase,
        { provide: IPostRepository, useValue: mockRepository },
        { provide: PostAuditService, useValue: mockAudit },
      ],
    }).compile();

    useCase = module.get(PublishPostUseCase);
    jest.clearAllMocks();
    mockAudit.record.mockResolvedValue(undefined);
    mockRepository.findById.mockResolvedValue(publishable());
    mockRepository.publish.mockImplementation((_id, _v, data) =>
      Promise.resolve(publishable({ ...data, version: 3 })),
    );
  });

  it('throws NotFound for an unknown id', async () => {
    mockRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing', { version: 0 })).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('publishing now', () => {
    it('sets status PUBLISHED and publishedAt to now', async () => {
      const before = Date.now();
      await useCase.execute('post-1', { version: 2 });

      const data = mockRepository.publish.mock.calls[0][2];
      expect(data.status).toBe(ContentStatus.PUBLISHED);
      expect(data.scheduledAt).toBeNull();
      expect(data.publishedAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  describe('scheduling', () => {
    it('stores the future moment in publishedAt, not just scheduledAt', async () => {
      // The whole design rests on this: publishedAt is what the visibility
      // predicate reads, so a scheduled item goes live on time even if the
      // status-normalising job never runs.
      const future = new Date(Date.now() + 3_600_000).toISOString();

      await useCase.execute('post-1', { version: 2, scheduledAt: future });

      const data = mockRepository.publish.mock.calls[0][2];
      expect(data.status).toBe(ContentStatus.SCHEDULED);
      expect(data.publishedAt.toISOString()).toBe(future);
      expect(data.scheduledAt.toISOString()).toBe(future);
    });

    it('rejects a schedule in the past', async () => {
      const past = new Date(Date.now() - 60_000).toISOString();

      await expect(
        useCase.execute('post-1', { version: 2, scheduledAt: past }),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepository.publish).not.toHaveBeenCalled();
    });
  });

  describe('completeness (FR-012)', () => {
    it.each([
      ['summary', { summary: '' }],
      ['body', { body: '' }],
      ['categoryId', { categoryId: null }],
      ['coverFileId', { coverFileId: null }],
    ])('refuses to publish without %s', async (_field, patch) => {
      mockRepository.findById.mockResolvedValue(publishable(patch));

      await expect(useCase.execute('post-1', { version: 2 })).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockRepository.publish).not.toHaveBeenCalled();
    });

    it('names the missing fields rather than failing generically', async () => {
      mockRepository.findById.mockResolvedValue(
        publishable({ categoryId: null, coverFileId: null }),
      );

      await expect(
        useCase.execute('post-1', { version: 2 }),
      ).rejects.toMatchObject({
        response: { missingFields: ['categoryId', 'coverFileId'] },
      });
    });

    // FR-057: a cover with no alt text is an accessibility hole on a public page.
    it('refuses a cover image with no alt text', async () => {
      mockRepository.findById.mockResolvedValue(
        publishable({ coverAltText: '   ' }),
      );

      await expect(
        useCase.execute('post-1', { version: 2 }),
      ).rejects.toMatchObject({
        response: { missingFields: ['coverAltText'] },
      });
    });
  });

  it('raises 409 when someone else saved first', async () => {
    mockRepository.publish.mockResolvedValue(null);

    await expect(useCase.execute('post-1', { version: 1 })).rejects.toThrow(
      ConflictException,
    );
  });

  // FR-064. The portal is the first module in this codebase to write AuditLog
  // rows, so this is asserted rather than assumed to work.
  describe('the audit record', () => {
    const ACTOR_ID = '99999999-9999-4999-8999-999999999999';

    it('names the actor and the item', async () => {
      await useCase.execute('post-1', { version: 2 }, ACTOR_ID);

      expect(mockAudit.record).toHaveBeenCalledWith(
        POST_AUDIT_ACTIONS.PUBLISH,
        expect.objectContaining({ id: 'post-1' }),
        ACTOR_ID,
      );
    });

    // The decision to put this on the school's website was taken now, by this
    // person, whichever moment it actually goes out.
    it('is written for a scheduled publish too', async () => {
      await useCase.execute(
        'post-1',
        { version: 2, scheduledAt: '2030-01-01T00:00:00.000Z' },
        ACTOR_ID,
      );

      expect(mockAudit.record).toHaveBeenCalledTimes(1);
    });

    it('is not written when the publish was refused', async () => {
      mockRepository.publish.mockResolvedValue(null);

      await expect(
        useCase.execute('post-1', { version: 1 }, ACTOR_ID),
      ).rejects.toThrow(ConflictException);
      expect(mockAudit.record).not.toHaveBeenCalled();
    });
  });
});
