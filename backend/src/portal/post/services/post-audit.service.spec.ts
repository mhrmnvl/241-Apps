import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuditLogUseCase } from '../../../platform/audit-log/use-cases/create-audit-log.use-case.js';
import { POST_AUDIT_ACTIONS } from '../constants/post.constants.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { PostAuditService } from './post-audit.service.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

const post = {
  id: 'post-1',
  type: PostType.BERITA,
  title: 'Juara 1 Olimpiade',
  slug: 'juara-1-olimpiade',
};

describe('PostAuditService', () => {
  let service: PostAuditService;
  const createAuditLog = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        PostAuditService,
        { provide: CreateAuditLogUseCase, useValue: createAuditLog },
      ],
    }).compile();

    service = module.get(PostAuditService);
    jest.clearAllMocks();
    createAuditLog.execute.mockResolvedValue({});
  });

  it('records the actor, the action, and enough to identify the item later', async () => {
    await service.record(POST_AUDIT_ACTIONS.PUBLISH, post, 'actor-1');

    expect(createAuditLog.execute).toHaveBeenCalledWith({
      userId: 'actor-1',
      action: POST_AUDIT_ACTIONS.PUBLISH,
      resource: 'portal-post',
      resourceId: 'post-1',
      metadata: {
        type: PostType.BERITA,
        title: 'Juara 1 Olimpiade',
        slug: 'juara-1-olimpiade',
      },
    });
  });

  /**
   * The stated failure policy, pinned so it cannot drift into "throw".
   *
   * By the time this runs the post is already published or deleted. Throwing
   * would report failure for something that demonstrably happened and send the
   * editor round to retry an action that already took effect.
   */
  it('does not fail the operation when the audit write fails', async () => {
    createAuditLog.execute.mockRejectedValue(new Error('audit table down'));

    await expect(
      service.record(POST_AUDIT_ACTIONS.DELETE, post, 'actor-1'),
    ).resolves.toBeUndefined();
  });

  it('still records an action taken without an identifiable actor', async () => {
    await service.record(POST_AUDIT_ACTIONS.UNPUBLISH, post, null);

    expect(createAuditLog.execute).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null }),
    );
  });
});
