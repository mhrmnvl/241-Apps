import { ContentStatus } from '../../../post/domain/enums/content-status.enum.js';

export interface PortalPageEntity {
  id: string;
  title: string;
  slug: string;
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: `${ContentStatus}`;
  publishedAt: Date | null;
  authorId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreatePageInput {
  title: string;
  slug: string;
  body: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  authorId: string;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  body?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export abstract class IPageRepository {
  abstract findAll(includeDeleted?: boolean): Promise<PortalPageEntity[]>;

  abstract findById(id: string): Promise<PortalPageEntity | null>;

  /** Composes the visibility predicate — a draft page is not reachable. */
  abstract findPublicBySlug(
    slug: string,
    now?: Date,
  ): Promise<PortalPageEntity | null>;

  abstract findByHistoricalSlug(
    slug: string,
  ): Promise<{ pageId: string; currentSlug: string } | null>;

  abstract recordSlugHistory(pageId: string, slug: string): Promise<void>;

  abstract findTakenSlugs(prefix: string): Promise<string[]>;

  abstract create(data: CreatePageInput): Promise<PortalPageEntity>;

  abstract update(
    id: string,
    expectedVersion: number,
    data: UpdatePageInput,
  ): Promise<PortalPageEntity | null>;

  abstract publish(
    id: string,
    expectedVersion: number,
    publishedAt: Date,
  ): Promise<PortalPageEntity | null>;

  abstract unpublish(
    id: string,
    expectedVersion: number,
  ): Promise<PortalPageEntity | null>;

  abstract softDelete(id: string): Promise<void>;

  /** Visible pages, for the sitemap. */
  abstract findAllVisible(
    now?: Date,
  ): Promise<{ slug: string; updatedAt: Date }[]>;
}
