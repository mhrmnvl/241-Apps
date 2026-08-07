import { Injectable } from '@nestjs/common';
import { IMediaUsageRepository } from '../domain/interfaces/media-usage-repository.interface.js';

/**
 * Which content items reference a file (FR-058).
 *
 * A join over `portal_media_usages` rather than a scan of every stored body —
 * which is the entire reason the table exists. It also answers "why is this
 * image not showing publicly": each owner carries whether it is currently
 * visible, so the editor sees that the image is fine and the article is a draft.
 */
@Injectable()
export class GetMediaUsageUseCase {
  constructor(private readonly mediaUsageRepository: IMediaUsageRepository) {}

  async execute(fileId: string) {
    const owners = await this.mediaUsageRepository.findOwners(fileId);

    return {
      fileId,
      isPubliclyReachable: owners.some((owner) => owner.isPublic),
      usedBy: owners,
    };
  }
}
