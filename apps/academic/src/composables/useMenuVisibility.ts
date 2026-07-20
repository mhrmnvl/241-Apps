import { computed } from 'vue'
import { useAuthSession } from '@/features/platform/auth'
import { menuSections } from '@/config/menuConfig'
import type { MenuSection, MenuItem, SubMenuItem } from '@/config/menuConfig'

/**
 * Memfilter menu sidebar berdasarkan role user yang sedang login.
 * - SUPER_ADMIN: semua menu tampil
 * - Staff (role custom / ADMIN / TEACHER): semua menu staff tampil
 * - STUDENT: hanya section dengan allowedRoles yang include STUDENT
 * - Tidak punya role: hanya menu tanpa allowedRoles (Dashboard)
 */
export function useMenuVisibility() {
  const { roles, hasRole, isStaff } = useAuthSession()

  const effectiveHasRole = (r: string): boolean => {
    if (roles.value.includes(r)) return true
    if (
      isStaff.value &&
      (r === 'ADMIN' || r === 'TEACHER') &&
      !hasRole('STUDENT')
    )
      return true
    return false
  }

  const filteredSections = computed((): MenuSection[] => {
    if (hasRole('SUPER_ADMIN')) return menuSections

    return menuSections
      .filter((section: MenuSection) => {
        if (!section.allowedRoles?.length) return true
        return section.allowedRoles.some(effectiveHasRole)
      })
      .map((section: MenuSection): MenuSection | null => {
        const filteredItems = section.items
          .filter((item: MenuItem) => {
            if (!item.allowedRoles?.length) return true
            return item.allowedRoles.some(effectiveHasRole)
          })
          .map((item: MenuItem): MenuItem | null => {
            if (!item.items) return item
            const filteredSubs = item.items.filter((sub: SubMenuItem) => {
              if (!sub.allowedRoles?.length) return true
              return sub.allowedRoles.some(effectiveHasRole)
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
