export interface PostCategoryEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
}

/** The public filter bar needs the count as well as the name. */
export interface PostCategoryWithCount extends PostCategoryEntity {
  publishedCount: number;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

/** What a delete attempt is refused with (FR-037). */
export interface CategoryUsage {
  count: number;
  /** A handful of titles, so the message says what is in the way. */
  sampleTitles: string[];
}

export abstract class ICategoryRepository {
  /** Active, non-deleted categories in display order. */
  abstract findAllActive(): Promise<PostCategoryEntity[]>;

  /** Management listing — includes deactivated ones, excludes deleted. */
  abstract findAll(): Promise<PostCategoryEntity[]>;

  abstract findById(id: string): Promise<PostCategoryEntity | null>;

  abstract findBySlug(slug: string): Promise<PostCategoryEntity | null>;

  /** Active categories with how many published items each holds (FR-023). */
  abstract findActiveWithPublishedCounts(
    now?: Date,
  ): Promise<PostCategoryWithCount[]>;

  abstract create(data: CreateCategoryInput): Promise<PostCategoryEntity>;

  abstract update(
    id: string,
    data: UpdateCategoryInput,
  ): Promise<PostCategoryEntity>;

  /** How many non-deleted posts still point here, and a sample of them. */
  abstract findUsage(id: string): Promise<CategoryUsage>;

  abstract softDelete(id: string): Promise<void>;
}
