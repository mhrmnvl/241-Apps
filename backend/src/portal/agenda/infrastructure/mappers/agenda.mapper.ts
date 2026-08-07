import { PUBLIC_MEDIA_PATH } from '../../../post/constants/post.constants.js';
import { AgendaEntryRow } from '../../domain/interfaces/agenda-repository.interface.js';

/** Stable public address for a file, or null. Never a signed URL. */
function mediaUrl(fileId: string | null): string | null {
  return fileId ? `${PUBLIC_MEDIA_PATH}/${fileId}` : null;
}

/**
 * The public shape. No status, no version, no authorId — a visitor has no use
 * for the editorial process, and `status` would tell a scraper which entries
 * are scheduled.
 */
export function toPublicAgenda(entry: AgendaEntryRow) {
  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    description: entry.description,
    startTime: entry.startTime,
    endTime: entry.endTime,
    location: entry.location,
    coverImageUrl: mediaUrl(entry.coverFileId),
    publishedAt: entry.publishedAt!,
  };
}

export function toAdminAgenda(entry: AgendaEntryRow) {
  return {
    ...entry,
    coverImageUrl: mediaUrl(entry.coverFileId),
  };
}
