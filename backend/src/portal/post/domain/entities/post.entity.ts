import { ContentStatus } from '../enums/content-status.enum.js';
import { PostType } from '../enums/post-type.enum.js';

export interface PostEntity {
  id: string;
  type: `${PostType}`;
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverFileId: string | null;
  coverAltText: string | null;
  categoryId: string | null;
  status: `${ContentStatus}`;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  expiresAt: Date | null;
  attachmentFileId: string | null;
  pinnedAt: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  authorId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PostAuthorRef {
  id: string;
  identifier: string;
  profile?: { name: string } | null;
}

export interface PostCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface PostFileRef {
  id: string;
  storageKey: string;
  mimeType: string;
}

export interface PostTagRef {
  id: string;
  name: string;
  slug: string;
}

export interface PostWithDetails extends PostEntity {
  author: PostAuthorRef;
  category: PostCategoryRef | null;
  coverFile: PostFileRef | null;
  attachment?: PostFileRef | null;
  tags?: { tag: PostTagRef }[];
}
