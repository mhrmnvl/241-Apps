export interface NavItemEntity {
  id: string;
  label: string;
  pageId: string | null;
  routeKey: string | null;
  externalUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

/** What the public menu renders: a label and one resolved destination. */
export interface PublicNavItem {
  id: string;
  label: string;
  /** A portal path, or an absolute external URL. */
  href: string;
  isExternal: boolean;
}

export interface CreateNavItemInput {
  label: string;
  pageId?: string | null;
  routeKey?: string | null;
  externalUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateNavItemInput = Partial<CreateNavItemInput>;

export abstract class INavigationRepository {
  abstract findAll(): Promise<NavItemEntity[]>;

  abstract findById(id: string): Promise<NavItemEntity | null>;

  /**
   * Active items in display order, with entries pointing at an unpublished
   * page omitted — a menu link into a 404 is worse than a missing menu entry
   * (FR-053).
   */
  abstract findPublic(now?: Date): Promise<PublicNavItem[]>;

  abstract create(data: CreateNavItemInput): Promise<NavItemEntity>;

  abstract update(id: string, data: UpdateNavItemInput): Promise<NavItemEntity>;

  abstract reorder(itemIds: string[]): Promise<void>;

  abstract delete(id: string): Promise<void>;
}
