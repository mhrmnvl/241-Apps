import type { File } from '@prisma/client';
import { StorageService } from '../../../core/storage/storage.service.js';

/**
 * Attaches a signed, time-limited `avatar` URL derived from the linked
 * `avatarFile` — the bucket is private, so a URL is never stored, only
 * generated fresh at read time. Kept in one place so every profile
 * read/write path (get, update, photo upload) produces the same shape.
 */
export async function withAvatarUrl<T extends { avatarFile?: File | null }>(
  profile: T,
  storage: StorageService,
): Promise<T & { avatar: string | null }> {
  const avatar = profile.avatarFile
    ? await storage.getSignedUrl(profile.avatarFile.storageKey)
    : null;
  return { ...profile, avatar };
}
