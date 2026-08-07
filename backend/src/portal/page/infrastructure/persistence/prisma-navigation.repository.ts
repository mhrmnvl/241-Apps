import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreateNavItemInput,
  INavigationRepository,
  NavItemEntity,
  PublicNavItem,
  UpdateNavItemInput,
} from '../../domain/interfaces/navigation-repository.interface.js';
import { visiblePageWhere } from './page.where.js';

const NAV_FIELDS = {
  id: true,
  label: true,
  pageId: true,
  routeKey: true,
  externalUrl: true,
  displayOrder: true,
  isActive: true,
} as const;

@Injectable()
export class PrismaNavigationRepository extends INavigationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<NavItemEntity[]> {
    return this.prisma.portalNavItem.findMany({
      select: NAV_FIELDS,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(id: string): Promise<NavItemEntity | null> {
    return this.prisma.portalNavItem.findUnique({
      where: { id },
      select: NAV_FIELDS,
    });
  }

  /**
   * FR-053: an item pointing at an unpublished page is dropped rather than
   * rendered as a link into a 404.
   *
   * Filtered in the query rather than after it — `page: visiblePageWhere()` on
   * a nullable relation excludes rows whose page fails the predicate while
   * keeping rows with no page at all, which is exactly the rule.
   */
  async findPublic(now: Date = new Date()): Promise<PublicNavItem[]> {
    const rows = await this.prisma.portalNavItem.findMany({
      where: {
        isActive: true,
        OR: [{ pageId: null }, { page: { is: visiblePageWhere(now) } }],
      },
      select: { ...NAV_FIELDS, page: { select: { slug: true } } },
      orderBy: { displayOrder: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      href:
        row.externalUrl ??
        (row.page ? `/${row.page.slug}` : `/${row.routeKey ?? ''}`),
      isExternal: row.externalUrl !== null,
    }));
  }

  async create(data: CreateNavItemInput): Promise<NavItemEntity> {
    return this.prisma.portalNavItem.create({
      data: {
        label: data.label,
        pageId: data.pageId ?? null,
        routeKey: data.routeKey ?? null,
        externalUrl: data.externalUrl ?? null,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
      },
      select: NAV_FIELDS,
    });
  }

  async update(id: string, data: UpdateNavItemInput): Promise<NavItemEntity> {
    return this.prisma.portalNavItem.update({
      where: { id },
      data,
      select: NAV_FIELDS,
    });
  }

  /**
   * Position is the array index, so the client sends the order it rendered
   * rather than a set of numbers it had to compute. One transaction, because a
   * half-applied reorder leaves the menu in an order nobody chose.
   */
  async reorder(itemIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      itemIds.map((id, index) =>
        this.prisma.portalNavItem.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.portalNavItem.delete({ where: { id } });
  }
}
