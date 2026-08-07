import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  AgendaEntryRow,
  AgendaQueryInput,
  CreateAgendaInput,
  IAgendaRepository,
  PublicAgendaQueryInput,
  UpdateAgendaInput,
} from '../../domain/interfaces/agenda-repository.interface.js';
import { updateIfVersionMatches } from '../../../shared/persistence/optimistic-update.js';
import {
  agendaScopeOrder,
  agendaScopeWhere,
  buildAdminAgendaWhere,
  visibleAgendaWhere,
} from './agenda.where.js';

@Injectable()
export class PrismaAgendaRepository extends IAgendaRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: AgendaQueryInput,
  ): Promise<PaginatedResult<AgendaEntryRow>> {
    const { page = 1, limit = 10 } = query;
    const where = buildAdminAgendaWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.agendaEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ startTime: 'desc' }],
      }),
      this.prisma.agendaEntry.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AgendaEntryRow | null> {
    return this.prisma.agendaEntry.findFirst({ where: { id } });
  }

  async findPublic(
    query: PublicAgendaQueryInput,
    now: Date = new Date(),
  ): Promise<PaginatedResult<AgendaEntryRow>> {
    const { page = 1, limit = 10, scope } = query;
    const where = agendaScopeWhere(scope, now);

    const [data, total] = await Promise.all([
      this.prisma.agendaEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: agendaScopeOrder(scope),
      }),
      this.prisma.agendaEntry.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findPublicBySlug(
    slug: string,
    now: Date = new Date(),
  ): Promise<AgendaEntryRow | null> {
    // Deliberately scope-free: a finished event stays readable at its own
    // address. Only the listing splits upcoming from past.
    return this.prisma.agendaEntry.findFirst({
      where: { ...visibleAgendaWhere(now), slug },
    });
  }

  async findUpcoming(
    take: number,
    now: Date = new Date(),
  ): Promise<AgendaEntryRow[]> {
    return this.prisma.agendaEntry.findMany({
      where: agendaScopeWhere('upcoming', now),
      take,
      orderBy: agendaScopeOrder('upcoming'),
    });
  }

  async findTakenSlugs(prefix: string): Promise<string[]> {
    const rows = await this.prisma.agendaEntry.findMany({
      where: { slug: { startsWith: prefix } },
      select: { slug: true },
    });
    return rows.map((row) => row.slug);
  }

  async create(data: CreateAgendaInput): Promise<AgendaEntryRow> {
    return this.prisma.agendaEntry.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        coverFileId: data.coverFileId ?? null,
        authorId: data.authorId,
      },
    });
  }

  async update(id: string, expectedVersion: number, data: UpdateAgendaInput) {
    const payload: Prisma.AgendaEntryUncheckedUpdateInput = {
      version: { increment: 1 },
    };
    if (data.title !== undefined) payload.title = data.title;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.startTime !== undefined) payload.startTime = data.startTime;
    if (data.endTime !== undefined) payload.endTime = data.endTime;
    if (data.location !== undefined) payload.location = data.location;
    if (data.coverFileId !== undefined) payload.coverFileId = data.coverFileId;

    return this.updateIfVersionMatches(id, expectedVersion, payload);
  }

  async publish(
    id: string,
    expectedVersion: number,
    status: `${ContentStatus}`,
    publishedAt: Date,
    scheduledAt: Date | null,
  ) {
    return this.updateIfVersionMatches(id, expectedVersion, {
      status,
      publishedAt,
      scheduledAt,
      version: { increment: 1 },
    });
  }

  async unpublish(id: string, expectedVersion: number) {
    return this.updateIfVersionMatches(id, expectedVersion, {
      status: ContentStatus.DRAFT,
      publishedAt: null,
      scheduledAt: null,
      version: { increment: 1 },
    });
  }

  async archive(id: string, expectedVersion: number) {
    return this.updateIfVersionMatches(id, expectedVersion, {
      status: ContentStatus.ARCHIVED,
      version: { increment: 1 },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.agendaEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<AgendaEntryRow> {
    return this.prisma.agendaEntry.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async findAllVisible(now: Date = new Date()) {
    return this.prisma.agendaEntry.findMany({
      where: visibleAgendaWhere(now),
      select: { slug: true, updatedAt: true },
    });
  }

  private updateIfVersionMatches(
    id: string,
    expectedVersion: number,
    data: Prisma.AgendaEntryUncheckedUpdateInput,
  ): Promise<AgendaEntryRow | null> {
    return updateIfVersionMatches(
      () =>
        this.prisma.agendaEntry.updateMany({
          where: { id, version: expectedVersion, deletedAt: null },
          data,
        }),
      () => this.prisma.agendaEntry.findFirstOrThrow({ where: { id } }),
    );
  }
}
