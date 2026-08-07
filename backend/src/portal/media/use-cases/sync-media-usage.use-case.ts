import { Injectable } from '@nestjs/common';
import { MediaUsageKind } from '../domain/enums/media-usage-kind.enum.js';
import {
  IMediaUsageRepository,
  MediaUsageInput,
  MediaUsageOwnerColumn,
} from '../domain/interfaces/media-usage-repository.interface.js';
import { extractMediaIds } from '../infrastructure/parsers/media-reference.parser.js';

export interface SyncMediaUsageCommand {
  column: MediaUsageOwnerColumn;
  ownerId: string;
  /** Already sanitized. Sanitization happens once, on write, before this runs. */
  body?: string | null;
  coverFileId?: string | null;
  attachmentFileId?: string | null;
  /** Album photos and any other explicitly attached files. */
  albumPhotoFileIds?: string[];
}

/**
 * Recomputes which files a content item references (research R2).
 *
 * Recomputed rather than incrementally maintained: an editor removing an image
 * from the body leaves no event behind, so the only reliable answer is to read
 * what the saved content actually references and write exactly that. The set is
 * small and the write is one transaction.
 *
 * Ordering matters — this runs *after* the content write, so the body it parses
 * is the sanitized body that was actually stored, not the one that was sent.
 */
@Injectable()
export class SyncMediaUsageUseCase {
  constructor(private readonly mediaUsageRepository: IMediaUsageRepository) {}

  async execute(command: SyncMediaUsageCommand): Promise<void> {
    const owner = { [command.column]: command.ownerId };
    const usages = new Map<string, MediaUsageInput>();

    /** Keyed by file + kind, so one image used as both cover and body counts
     *  once per role rather than producing duplicate rows. */
    const add = (fileId: string, kind: `${MediaUsageKind}`) => {
      usages.set(`${fileId}:${kind}`, { fileId, kind, ...owner });
    };

    if (command.coverFileId) add(command.coverFileId, MediaUsageKind.COVER);
    if (command.attachmentFileId) {
      add(command.attachmentFileId, MediaUsageKind.ATTACHMENT);
    }
    for (const fileId of command.albumPhotoFileIds ?? []) {
      add(fileId, MediaUsageKind.ALBUM_PHOTO);
    }
    for (const fileId of extractMediaIds(command.body ?? '')) {
      add(fileId, MediaUsageKind.BODY);
    }

    await this.mediaUsageRepository.replaceForOwner(
      command.column,
      command.ownerId,
      [...usages.values()],
    );
  }
}
