import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../../../core/storage/storage.service.js';
import { IFileRepository } from '../../../platform/file/domain/interfaces/file-repository.interface.js';
import { sharePreviewKey } from '../../../platform/file/constants/file-upload.constants.js';
import { PREVIEW_VARIANT } from '../../homepage/constants/meta.constants.js';
import { IMediaUsageRepository } from '../domain/interfaces/media-usage-repository.interface.js';

/**
 * The only public path to a stored file (research R2).
 *
 * Authorization is *derived*, never stored: a file is public exactly while some
 * currently-visible content references it. Unpublishing an article revokes its
 * images the same instant, with no revocation step anyone can forget, and a
 * draft's images are unreachable without a flag anyone has to set.
 *
 * The response is a redirect to a freshly-minted signed URL rather than the
 * signed URL itself. That keeps the public address stable and permanent — which
 * is what makes it usable in `og:image` and in a search index — while the
 * expiring credential stays behind it. A crawler caching an expiring URL is
 * exactly the failure this avoids.
 */
@Injectable()
export class GetPublicMediaUseCase {
  constructor(
    private readonly mediaUsageRepository: IMediaUsageRepository,
    // platform/file is the supplier: this module never touches `files` itself.
    private readonly fileRepository: IFileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(fileId: string, variant?: string): Promise<string> {
    const authorized =
      await this.mediaUsageRepository.isPubliclyReferenced(fileId);

    // 404, never 403. A 403 would confirm the file exists and is merely
    // withheld, which is a way to enumerate unpublished work by its images.
    if (!authorized) {
      throw new NotFoundException('Document not found');
    }

    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundException('Document not found');
    }

    // The share-preview variant is derived from the original's key rather than
    // recorded, so there is nothing to keep in step. If it was never generated
    // — an upload that predates the variant, or one whose generation failed —
    // the redirect lands on the original, which is a worse card but not a
    // broken one (T114).
    const key =
      variant === PREVIEW_VARIANT
        ? sharePreviewKey(file.storageKey)
        : file.storageKey;

    return this.storage.getSignedUrl(key);
  }
}
