import { Injectable } from '@nestjs/common';
import { StorageService } from '../../../core/storage/storage.service.js';
import { IFileRepository } from '../../../platform/file/domain/interfaces/file-repository.interface.js';
import { PUBLIC_MEDIA_PATH } from '../../post/constants/post.constants.js';

/**
 * The picker's library: what has already been uploaded under the PORTAL app
 * key, so an editor reuses rather than re-uploads (FR-055).
 *
 * Two URLs per file, and the distinction matters:
 *
 * - `previewUrl` is a signed URL, used only to render the thumbnail inside the
 *   authenticated picker. It has to be signed, because most items in the
 *   library belong to drafts and are not publicly reachable yet.
 * - `publicUrl` is the stable `/portal/public/media/:id` address, and is the
 *   one that gets written into content. It 404s until published content
 *   references the file, which is exactly the behaviour we want.
 *
 * Putting a signed URL into a post body is the failure research R2 exists to
 * prevent: it works in testing and breaks days later when the signature
 * expires, and a crawler may have cached the dead URL in the meantime.
 */
@Injectable()
export class GetMediaLibraryUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute() {
    const files = await this.fileRepository.findManyByAppKey('PORTAL');

    return Promise.all(
      files.map(async (file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        createdAt: file.createdAt,
        previewUrl: await this.storage.getSignedUrl(file.storageKey),
        publicUrl: `${PUBLIC_MEDIA_PATH}/${file.id}`,
      })),
    );
  }
}
