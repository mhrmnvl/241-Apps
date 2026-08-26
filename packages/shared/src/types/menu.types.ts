import type { LucideIcon } from 'lucide-vue-next'

export interface SubMenuItem {
  key?: string
  title: string
  url: string
  requiredPermission?: string
  /**
   * Shown to anyone holding at least one of these.
   *
   * For an entry two kinds of person reach by two different permissions — the
   * teaching-assignment list answers to `teaching-assignments.read` for whoever
   * runs the school and `teaching-assignments.read-own` for the teacher whose
   * assignments they are. One string could only name one of them, so the entry
   * either hid from the teacher or was offered to everybody.
   *
   * `requiredPermission` wins where both are given.
   */
  requiredAnyPermission?: string[]
  allowedRoles?: string[]
}

export interface MenuItem {
  key?: string
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  requiredPermission?: string
  /** See `SubMenuItem.requiredAnyPermission`. */
  requiredAnyPermission?: string[]
  allowedRoles?: string[]
  items?: SubMenuItem[]
}

export interface MenuSection {
  key?: string
  label: string
  requiredPermission?: string
  /** See `SubMenuItem.requiredAnyPermission`. */
  requiredAnyPermission?: string[]
  allowedRoles?: string[]
  items: MenuItem[]
}

export function menuItemKey(item: {
  key?: string
  url: string
  title?: string
}): string {
  return item.key ?? (item.url === '#' && item.title ? item.title : item.url)
}
