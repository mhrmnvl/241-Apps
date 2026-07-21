import { computed } from 'vue'
import { useAuthSession } from '@/features/platform/auth'
import { menuSections } from '@/config/menuConfig'
import type { MenuSection, MenuItem, SubMenuItem } from '@/config/menuConfig'

export function useMenuVisibility() {
  const { roles, permissions } = useAuthSession()

  const isSuperAdmin = computed(() => roles.value.includes('SUPER_ADMIN'))

  function canShowByPermission(required?: string): boolean {
    if (!required) return true
    if (isSuperAdmin.value) return true
    return permissions.value.includes(required)
  }

  function canShowByRole(allowed?: string[]): boolean {
    if (!allowed || allowed.length === 0) return true
    if (isSuperAdmin.value) return true
    return allowed.some((r) => roles.value.includes(r))
  }

  const filteredSections = computed((): MenuSection[] => {
    return menuSections
      .filter((section: MenuSection) => {
        if (section.requiredPermission)
          return canShowByPermission(section.requiredPermission)
        if (section.allowedRoles) return canShowByRole(section.allowedRoles)
        return true
      })
      .map((section: MenuSection): MenuSection | null => {
        const filteredItems = section.items
          .filter((item: MenuItem) => {
            if (item.requiredPermission)
              return canShowByPermission(item.requiredPermission)
            if (item.allowedRoles) return canShowByRole(item.allowedRoles)
            return true
          })
          .map((item: MenuItem): MenuItem | null => {
            if (!item.items) return item
            const filteredSubs = item.items.filter((sub: SubMenuItem) => {
              if (sub.requiredPermission)
                return canShowByPermission(sub.requiredPermission)
              if (sub.allowedRoles) return canShowByRole(sub.allowedRoles)
              return true
            })
            if (filteredSubs.length === 0 && item.items.length > 0) return null
            return { ...item, items: filteredSubs }
          })
          .filter((item): item is MenuItem => item !== null)

        if (filteredItems.length === 0) return null
        return { ...section, items: filteredItems }
      })
      .filter((section): section is MenuSection => section !== null)
  })

  return { filteredSections }
}
