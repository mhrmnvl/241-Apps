import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IMediaUsageRepository,
  MediaUsageInput,
  MediaUsageOwner,
  MediaUsageOwnerColumn,
} from '../../domain/interfaces/media-usage-repository.interface.js';

/**
 * The visibility predicate as a *relation* filter.
 *
 * `post.where.ts` owns the canonical definition and every post query composes
 * it. This is the one place it has to be restated, because Prisma cannot take a
 * `PostWhereInput` built elsewhere inside a nested relation filter here without
 * losing the typing that makes the rest safe. Kept character-for-character
 * equivalent on purpose — a drift here would make an unpublished item's images
 * publicly fetchable while every other surface correctly hid it.
 */
function visibleOwnerFilter(now: Date) {
  return {
    deletedAt: null,
    status: { in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED] },
    publishedAt: { not: null, lte: now },
  } satisfies Prisma.PostWhereInput;
}

@Injectable()
export class PrismaMediaUsageRepository extends IMediaUsageRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async replaceForOwner(
    column: MediaUsageOwnerColumn,
    ownerId: string,
    usages: MediaUsageInput[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.portalMediaUsage.deleteMany({ where: { [column]: ownerId } }),
      this.prisma.portalMediaUsage.createMany({
        data: usages.map((usage) => ({
          fileId: usage.fileId,
          kind: usage.kind,
          postId: usage.postId ?? null,
          agendaId: usage.agendaId ?? null,
          albumId: usage.albumId ?? null,
          pageId: usage.pageId ?? null,
        })),
      }),
    ]);
  }

  async isPubliclyReferenced(
    fileId: string,
    now: Date = new Date(),
  ): Promise<boolean> {
    const match = await this.prisma.portalMediaUsage.findFirst({
      where: { fileId, post: visibleOwnerFilter(now) },
      select: { id: true },
    });
    return match !== null;
  }

  async findOwners(
    fileId: string,
    now: Date = new Date(),
  ): Promise<MediaUsageOwner[]> {
    const rows = await this.prisma.portalMediaUsage.findMany({
      where: { fileId },
      select: {
        kind: true,
        postId: true,
        post: {
          select: {
            id: true,
            title: true,
            status: true,
            publishedAt: true,
            deletedAt: true,
          },
        },
      },
    });

    return rows
      .filter((row) => row.post !== null)
      .map((row) => ({
        kind: row.kind,
        ownerType: 'post' as const,
        ownerId: row.post!.id,
        title: row.post!.title,
        isPublic:
          row.post!.deletedAt === null &&
          (row.post!.status === ContentStatus.PUBLISHED ||
            row.post!.status === ContentStatus.SCHEDULED) &&
          row.post!.publishedAt !== null &&
          row.post!.publishedAt <= now,
      }));
  }

  async countUsagesForFile(fileId: string): Promise<number> {
    return this.prisma.portalMediaUsage.count({ where: { fileId } });
  }
}
