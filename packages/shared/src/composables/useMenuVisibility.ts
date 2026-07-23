import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { MenuItem, MenuSection, SubMenuItem } from '../types/menu.types'
import { menuItemKey } from '../types/menu.types'

export interface MenuVisibilityContext {
  roles: Ref<string[]> | ComputedRef<string[]>
  permissions: Ref<string[]> | ComputedRef<string[]>
  hiddenMenuKeys?: Ref<string[]> | ComputedRef<string[]>
}

/**
 * Pure filtering logic shared by every app's sidebar — takes the app's own
 * menuSections plus the caller's auth/settings state as plain args instead
 * of reading @241/platform's auth composable directly, so this package
 * doesn't depend on packages/platform (see CLAUDE.md's dependency-direction
 * rule: platform may depend on shared, never the reverse).
 */
export function useMenuVisibility(
  menuSections: MenuSection[],
  ctx: MenuVisibilityContext,
) {
  const isSuperAdmin = computed(() => ctx.roles.value.includes('SUPER_ADMIN'))
  const hiddenKeys = computed(() => new Set(ctx.hiddenMenuKeys?.value ?? []))

  function canShowByPermission(required?: string): boolean {
    if (!required) return true
    if (isSuperAdmin.value) return true
    return ctx.permissions.value.includes(required)
  }

  function canShowByRole(allowed?: string[]): boolean {
    if (!allowed || allowed.length === 0) return true
    if (isSuperAdmin.value) return true
    return allowed.some((r) => ctx.roles.value.includes(r))
  }

  // Sections have no `url` (they're not routable), so they can only be
  // hidden via an explicit `key` — a section without one is never toggled
  // by this mechanism, only by permission/role.
  function isSectionHidden(section: MenuSection): boolean {
    if (isSuperAdmin.value || !section.key) return false
    return hiddenKeys.value.has(section.key)
  }

  function isHidden(item: { key?: string; url: string }): boolean {
    if (isSuperAdmin.value) return false
    return hiddenKeys.value.has(menuItemKey(item))
  }

  const filteredSections = computed((): MenuSection[] => {
    return menuSections
      .filter((section: MenuSection) => {
        if (isSectionHidden(section)) return false
        if (section.requiredPermission)
          return canShowByPermission(section.requiredPermission)
        if (section.allowedRoles) return canShowByRole(section.allowedRoles)
        return true
      })
      .map((section: MenuSection): MenuSection | null => {
        const filteredItems = section.items
          .filter((item: MenuItem) => {
            if (isHidden(item)) return false
            if (item.requiredPermission)
              return canShowByPermission(item.requiredPermission)
            if (item.allowedRoles) return canShowByRole(item.allowedRoles)
            return true
          })
          .map((item: MenuItem): MenuItem | null => {
            if (!item.items) return item
            const filteredSubs = item.items.filter((sub: SubMenuItem) => {
              if (isHidden(sub)) return false
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
