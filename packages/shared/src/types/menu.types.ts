import type { LucideIcon } from 'lucide-vue-next'

export interface SubMenuItem {
  key?: string
  title: string
  url: string
  requiredPermission?: string
  allowedRoles?: string[]
}

export interface MenuItem {
  key?: string
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  requiredPermission?: string
  allowedRoles?: string[]
  items?: SubMenuItem[]
}

export interface MenuSection {
  key?: string
  label: string
  requiredPermission?: string
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
