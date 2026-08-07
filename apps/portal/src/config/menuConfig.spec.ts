import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useMenuVisibility } from '@/shared/composables/useMenuVisibility'
import { menuSections } from './menuConfig'
import type { MenuSection } from '@/shared/types/menu.types'

/**
 * FR-063 and the client half of ADR-0006.
 *
 * The sidebar is an optimistic gate — real enforcement is `PermissionGuard` —
 * but the two have to agree. A UI that offers an action the API then refuses is
 * worse than no UI: the editor finds out after writing the article. These tests
 * pin the agreement, because it is the kind of thing that drifts silently.
 */
function visibleFor(roles: string[], permissions: string[]): MenuSection[] {
  const { filteredSections } = useMenuVisibility(menuSections, {
    roles: ref(roles),
    permissions: ref(permissions),
  })
  return filteredSections.value
}

const PORTAL_EDITOR_PERMISSIONS = [
  'portal-posts.read',
  'portal-posts.create',
  'portal-posts.update',
  'portal-posts.publish',
  'portal-settings.read',
]

function everyRequiredPermission(sections: MenuSection[]): string[] {
  return sections.flatMap((section) => [
    ...(section.requiredPermission ? [section.requiredPermission] : []),
    ...section.items.flatMap((item) => [
      ...(item.requiredPermission ? [item.requiredPermission] : []),
      ...(item.items ?? []).flatMap((sub) =>
        sub.requiredPermission ? [sub.requiredPermission] : [],
      ),
    ]),
  ])
}

describe('portal menu visibility', () => {
  it('gates every entry on a permission — no entry is visible by default', () => {
    for (const section of menuSections) {
      const gated =
        Boolean(section.requiredPermission) ||
        section.items.every((item) => Boolean(item.requiredPermission))
      expect(gated, `section "${section.label}" is ungated`).toBe(true)
    }
  })

  it('gates on portal codes only, never on a SIAKAD one', () => {
    for (const permission of everyRequiredPermission(menuSections)) {
      expect(permission.startsWith('portal-'), permission).toBe(true)
    }
  })

  it('shows nothing at all to a signed-in user holding no portal codes', () => {
    expect(visibleFor(['TEACHER'], ['students.read'])).toEqual([])
  })

  // The mirror of ADR-0006: ADMIN's blanket bypass stops at `portal-`, so an
  // ADMIN without portal codes must see no management surface here either.
  it('shows nothing to an ADMIN who holds no portal codes', () => {
    expect(visibleFor(['ADMIN'], ['students.read', 'settings.update'])).toEqual(
      [],
    )
  })

  // The other half of the mirror: SUPER_ADMIN keeps the bypass as break-glass,
  // so the portal stays reachable if every portal operator is locked out.
  it('shows everything to a SUPER_ADMIN holding no portal codes', () => {
    expect(visibleFor(['SUPER_ADMIN'], [])).toHaveLength(menuSections.length)
  })

  it('shows the content and settings surfaces to a portal editor', () => {
    const sections = visibleFor(['PORTAL_EDITOR'], PORTAL_EDITOR_PERMISSIONS)

    expect(sections.map((section) => section.key)).toEqual(
      menuSections.map((section) => section.key),
    )
  })

  it('drops the settings surface from an editor who cannot read settings', () => {
    const sections = visibleFor(
      ['PORTAL_EDITOR'],
      PORTAL_EDITOR_PERMISSIONS.filter(
        (code) => code !== 'portal-settings.read',
      ),
    )

    expect(sections.map((section) => section.key)).not.toContain(
      'portal-settings',
    )
  })
})
