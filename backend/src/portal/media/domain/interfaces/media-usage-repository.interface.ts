import { MediaUsageKind } from '../enums/media-usage-kind.enum.js';

/**
 * One reference from portal content to a stored file.
 *
 * Exactly one owner id is set. The shape is a union rather than four separate
 * inputs so the "exactly one" rule has one place to be checked.
 */
export interface MediaUsageInput {
  fileId: string;
  kind: `${MediaUsageKind}`;
  postId?: string | null;
  agendaId?: string | null;
  albumId?: string | null;
  pageId?: string | null;
}

/** Which content item references a file — answers FR-058 by join, not by scan. */
export interface MediaUsageOwner {
  kind: `${MediaUsageKind}`;
  ownerType: 'post' | 'agenda' | 'album' | 'page';
  ownerId: string;
  title: string;
  /** Whether a visitor can currently see the owner — so the UI can say why the
   *  file is or is not publicly reachable. */
  isPublic: boolean;
}

export type MediaUsageOwnerColumn =
  'postId' | 'agendaId' | 'albumId' | 'pageId';

export abstract class IMediaUsageRepository {
  /**
   * Replaces every usage row for one owner. Delete-then-insert inside a single
   * transaction, so a content save never leaves the item with a half-written
   * set of references (ADR-0003 — one module, one transaction).
   */
  abstract replaceForOwner(
    column: MediaUsageOwnerColumn,
    ownerId: string,
    usages: MediaUsageInput[],
  ): Promise<void>;

  /**
   * True when at least one usage row for this file has a publicly visible
   * owner. This is the whole media authorization rule (research R2).
   */
  abstract isPubliclyReferenced(fileId: string, now?: Date): Promise<boolean>;

  abstract findOwners(fileId: string, now?: Date): Promise<MediaUsageOwner[]>;

  /** File ids referenced by portal content at all, published or not. */
  abstract countUsagesForFile(fileId: string): Promise<number>;
}
