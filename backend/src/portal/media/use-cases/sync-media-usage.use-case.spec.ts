import { Test, TestingModule } from '@nestjs/testing';
import { MediaUsageKind } from '../domain/enums/media-usage-kind.enum.js';
import { IMediaUsageRepository } from '../domain/interfaces/media-usage-repository.interface.js';
import { SyncMediaUsageUseCase } from './sync-media-usage.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const COVER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const IN_BODY = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SECOND_IN_BODY = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ATTACHMENT = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('SyncMediaUsageUseCase', () => {
  let useCase: SyncMediaUsageUseCase;
  const repository = { replaceForOwner: jest.fn() };

  /** The rows the use case decided to write, for readable assertions. */
  function written(): { fileId: string; kind: string }[] {
    const [, , usages] = repository.replaceForOwner.mock.calls[0] as [
      string,
      string,
      { fileId: string; kind: string }[],
    ];
    return usages;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        SyncMediaUsageUseCase,
        { provide: IMediaUsageRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(SyncMediaUsageUseCase);
    jest.clearAllMocks();
    repository.replaceForOwner.mockResolvedValue(undefined);
  });

  it('records the explicit cover and attachment', async () => {
    await useCase.execute({
      column: 'postId',
      ownerId: 'post-1',
      coverFileId: COVER,
      attachmentFileId: ATTACHMENT,
    });

    expect(written()).toEqual(
      expect.arrayContaining([
        { fileId: COVER, kind: MediaUsageKind.COVER, postId: 'post-1' },
        {
          fileId: ATTACHMENT,
          kind: MediaUsageKind.ATTACHMENT,
          postId: 'post-1',
        },
      ]),
    );
  });

  // The body is parsed for the stable public media path, which is the only way
  // a portal image is ever rendered (research R2).
  it('finds every image the body renders', async () => {
    await useCase.execute({
      column: 'postId',
      ownerId: 'post-1',
      body: `<p><img src="/portal/public/media/${IN_BODY}"></p><p><img src="/portal/public/media/${SECOND_IN_BODY}"></p>`,
    });

    expect(written().map((usage) => usage.fileId)).toEqual([
      IN_BODY,
      SECOND_IN_BODY,
    ]);
  });

  it('finds a file referenced from a download link, not only an img', async () => {
    await useCase.execute({
      column: 'postId',
      ownerId: 'post-1',
      body: `<a href="/portal/public/media/${IN_BODY}">Unduh</a>`,
    });

    expect(written()).toHaveLength(1);
  });

  it('ignores an external image the editor pasted in', async () => {
    await useCase.execute({
      column: 'postId',
      ownerId: 'post-1',
      body: '<img src="https://example.com/foto.jpg">',
    });

    expect(written()).toEqual([]);
  });

  it('writes one row per file when the same image appears twice in the body', async () => {
    await useCase.execute({
      column: 'postId',
      ownerId: 'post-1',
      body: `<img src="/portal/public/media/${IN_BODY}"><img src="/portal/public/media/${IN_BODY}">`,
    });

    expect(written()).toHaveLength(1);
  });

  // The same image as both cover and body is two distinct roles, and FR-058
  // wants the usage view to say which — so it is two rows, not one.
  it('keeps cover and body as separate roles for the same file', async () => {
    await useCase.execute({
      column: 'postId',
      ownerId: 'post-1',
      coverFileId: COVER,
      body: `<img src="/portal/public/media/${COVER}">`,
    });

    expect(written()).toEqual([
      { fileId: COVER, kind: MediaUsageKind.COVER, postId: 'post-1' },
      { fileId: COVER, kind: MediaUsageKind.BODY, postId: 'post-1' },
    ]);
  });

  // The recompute is what makes removal work: an image taken out of the body
  // leaves no event behind, so the set has to be rewritten wholesale.
  it('replaces the whole set rather than adding to it', async () => {
    await useCase.execute({ column: 'postId', ownerId: 'post-1', body: '' });

    expect(repository.replaceForOwner).toHaveBeenCalledWith(
      'postId',
      'post-1',
      [],
    );
  });

  it('records album photos under their own kind', async () => {
    await useCase.execute({
      column: 'albumId',
      ownerId: 'album-1',
      albumPhotoFileIds: [COVER, IN_BODY],
    });

    expect(written()).toEqual([
      { fileId: COVER, kind: MediaUsageKind.ALBUM_PHOTO, albumId: 'album-1' },
      { fileId: IN_BODY, kind: MediaUsageKind.ALBUM_PHOTO, albumId: 'album-1' },
    ]);
  });
});
