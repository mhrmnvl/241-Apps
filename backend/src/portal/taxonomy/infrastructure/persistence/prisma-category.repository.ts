import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CategoryUsage,
  CreateCategoryInput,
  ICategoryRepository,
  PostCategoryEntity,
  PostCategoryWithCount,
  UpdateCategoryInput,
} from '../../domain/interfaces/category-repository.interface.js';

const CATEGORY_FIELDS = {
  id: true,
  name: true,
  slug: true,
  description: true,
  isActive: true,
  displayOrder: true,
} as const;

const CATEGORY_ORDER = [{ displayOrder: 'asc' }, { name: 'asc' }] satisfies {
  displayOrder?: 'asc';
  name?: 'asc';
}[];

/** A sample large enough to be useful in the refusal, small enough to read. */
const USAGE_SAMPLE_SIZE = 5;

@Injectable()
export class PrismaCategoryRepository extends ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllActive(): Promise<PostCategoryEntity[]> {
    return this.prisma.postCategory.findMany({
      where: { isActive: true, deletedAt: null },
      select: CATEGORY_FIELDS,
      orderBy: CATEGORY_ORDER,
    });
  }

  async findAll(): Promise<PostCategoryEntity[]> {
    return this.prisma.postCategory.findMany({
      where: { deletedAt: null },
      select: CATEGORY_FIELDS,
      orderBy: CATEGORY_ORDER,
    });
  }

  async findById(id: string): Promise<PostCategoryEntity | null> {
    return this.prisma.postCategory.findFirst({
      where: { id, deletedAt: null },
      select: CATEGORY_FIELDS,
    });
  }

  async findBySlug(slug: string): Promise<PostCategoryEntity | null> {
    return this.prisma.postCategory.findFirst({
      where: { slug, deletedAt: null },
      select: CATEGORY_FIELDS,
    });
  }

  /**
   * Counted through the relation with the visibility predicate inlined as a
   * relation filter — the one place the portal restates it, because Prisma
   * cannot take a `PostWhereInput` inside `_count`. Kept identical to
   * `visiblePostWhere` on purpose; a category count that includes drafts would
   * advertise unpublished work by its number alone.
   */
  async findActiveWithPublishedCounts(
    now: Date = new Date(),
  ): Promise<PostCategoryWithCount[]> {
    const rows = await this.prisma.postCategory.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        ...CATEGORY_FIELDS,
        _count: {
          select: {
            posts: {
              where: {
                deletedAt: null,
                status: {
                  in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED],
                },
                publishedAt: { not: null, lte: now },
              },
            },
          },
        },
      },
      orderBy: CATEGORY_ORDER,
    });

    return rows.map(({ _count, ...category }) => ({
      ...category,
      publishedCount: _count.posts,
    }));
  }

  async create(data: CreateCategoryInput): Promise<PostCategoryEntity> {
    return this.prisma.postCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder ?? 0,
      },
      select: CATEGORY_FIELDS,
    });
  }

  async update(
    id: string,
    data: UpdateCategoryInput,
  ): Promise<PostCategoryEntity> {
    return this.prisma.postCategory.update({
      where: { id },
      data,
      select: CATEGORY_FIELDS,
    });
  }

  async findUsage(id: string): Promise<CategoryUsage> {
    const where = { categoryId: id, deletedAt: null };

    const [count, sample] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        select: { title: true },
        take: USAGE_SAMPLE_SIZE,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { count, sampleTitles: sample.map((post) => post.title) };
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.postCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
