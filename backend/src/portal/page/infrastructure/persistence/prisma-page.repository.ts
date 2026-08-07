import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreatePageInput,
  IPageRepository,
  PortalPageEntity,
  UpdatePageInput,
} from '../../domain/interfaces/page-repository.interface.js';
import { updateIfVersionMatches } from '../../../shared/persistence/optimistic-update.js';
import { visiblePageWhere } from './page.where.js';

@Injectable()
export class PrismaPageRepository extends IPageRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(includeDeleted = false): Promise<PortalPageEntity[]> {
    return this.prisma.portalPage.findMany({
      where: includeDeleted
        ? { deletedAt: { not: null } }
        : { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<PortalPageEntity | null> {
    return this.prisma.portalPage.findFirst({ where: { id } });
  }

  async findPublicBySlug(
    slug: string,
    now: Date = new Date(),
  ): Promise<PortalPageEntity | null> {
    return this.prisma.portalPage.findFirst({
      where: { ...visiblePageWhere(now), slug },
    });
  }

  async findByHistoricalSlug(slug: string) {
    const row = await this.prisma.portalPageSlugHistory.findUnique({
      where: { slug },
      select: { pageId: true, page: { select: { slug: true } } },
    });
    return row ? { pageId: row.pageId, currentSlug: row.page.slug } : null;
  }

  async recordSlugHistory(pageId: string, slug: string): Promise<void> {
    await this.prisma.portalPageSlugHistory.upsert({
      where: { slug },
      update: { pageId },
      create: { pageId, slug },
    });
  }

  async findTakenSlugs(prefix: string): Promise<string[]> {
    const rows = await this.prisma.portalPage.findMany({
      where: { slug: { startsWith: prefix } },
      select: { slug: true },
    });
    return rows.map((row) => row.slug);
  }

  async create(data: CreatePageInput): Promise<PortalPageEntity> {
    return this.prisma.portalPage.create({
      data: {
        title: data.title,
        slug: data.slug,
        body: data.body,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        authorId: data.authorId,
      },
    });
  }

  async update(id: string, expectedVersion: number, data: UpdatePageInput) {
    const payload: Prisma.PortalPageUncheckedUpdateInput = {
      version: { increment: 1 },
    };
    if (data.title !== undefined) payload.title = data.title;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.body !== undefined) payload.body = data.body;
    if (data.metaTitle !== undefined) payload.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) {
      payload.metaDescription = data.metaDescription;
    }

    return this.updateIfVersionMatches(id, expectedVersion, payload);
  }

  async publish(id: string, expectedVersion: number, publishedAt: Date) {
    return this.updateIfVersionMatches(id, expectedVersion, {
      status: ContentStatus.PUBLISHED,
      publishedAt,
      version: { increment: 1 },
    });
  }

  async unpublish(id: string, expectedVersion: number) {
    return this.updateIfVersionMatches(id, expectedVersion, {
      status: ContentStatus.DRAFT,
      publishedAt: null,
      version: { increment: 1 },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.portalPage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllVisible(now: Date = new Date()) {
    return this.prisma.portalPage.findMany({
      where: visiblePageWhere(now),
      select: { slug: true, updatedAt: true },
    });
  }

  private updateIfVersionMatches(
    id: string,
    expectedVersion: number,
    data: Prisma.PortalPageUncheckedUpdateInput,
  ): Promise<PortalPageEntity | null> {
    return updateIfVersionMatches(
      () =>
        this.prisma.portalPage.updateMany({
          where: { id, version: expectedVersion, deletedAt: null },
          data,
        }),
      () => this.prisma.portalPage.findFirstOrThrow({ where: { id } }),
    );
  }
}
