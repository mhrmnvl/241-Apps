export interface PostTagEntity {
  id: string;
  name: string;
  slug: string;
}

export interface CreateTagInput {
  name: string;
  slug: string;
}

export abstract class ITagRepository {
  abstract findAll(search?: string): Promise<PostTagEntity[]>;

  abstract findById(id: string): Promise<PostTagEntity | null>;

  abstract findBySlug(slug: string): Promise<PostTagEntity | null>;

  abstract create(data: CreateTagInput): Promise<PostTagEntity>;

  abstract rename(id: string, name: string): Promise<PostTagEntity>;

  /**
   * Hard delete, unlike a category. A tag carries no editorial meaning and
   * nothing requires one, so removing a mistyped label should leave no trace —
   * the join rows cascade and the posts themselves are untouched (FR-038).
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Resolves names to tags, creating any that do not exist yet. Tags are
   * created on first use rather than managed up front, which is the whole
   * difference between a tag and a category.
   */
  abstract resolveOrCreate(names: string[]): Promise<PostTagEntity[]>;

  /** Replaces a post's tag set outright. */
  abstract setPostTags(postId: string, tagIds: string[]): Promise<void>;

  abstract findByPostId(postId: string): Promise<PostTagEntity[]>;
}
