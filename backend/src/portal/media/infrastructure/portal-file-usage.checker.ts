import { Injectable } from '@nestjs/common';
import {
  FileUsageReference,
  IFileUsageChecker,
} from '../../../platform/file/domain/interfaces/file-usage-checker.interface.js';
import { IMediaUsageRepository } from '../domain/interfaces/media-usage-repository.interface.js';

const OWNER_LABELS: Record<string, string> = {
  post: 'Konten',
  agenda: 'Agenda',
  album: 'Album',
  page: 'Halaman',
};

/**
 * The portal's answer to "may this file be deleted?" (FR-058).
 *
 * Every reference blocks, not only the public ones: a draft that renders this
 * image is work someone is still doing, and deleting the file out from under it
 * would break an article nobody has looked at yet — the worst kind, because the
 * damage surfaces at publish time.
 */
@Injectable()
export class PortalFileUsageChecker extends IFileUsageChecker {
  constructor(private readonly mediaUsageRepository: IMediaUsageRepository) {
    super();
  }

  async findReferences(fileId: string): Promise<FileUsageReference[]> {
    const owners = await this.mediaUsageRepository.findOwners(fileId);

    return owners.map((owner) => ({
      label: `${OWNER_LABELS[owner.ownerType] ?? owner.ownerType} "${owner.title}"`,
      isPublic: owner.isPublic,
    }));
  }
}
