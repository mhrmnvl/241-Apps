import type { Ref } from 'vue'
import type { MenuSection } from '@/shared/types/menu.types'
import { menuItemKey } from '@/shared/types/menu.types'

function getSectionChildrenKeys(section: MenuSection): string[] {
  const keys: string[] = []
  for (const item of section.items) {
    keys.push(menuItemKey(item))
    if (item.items) {
      for (const sub of item.items) {
        keys.push(menuItemKey(sub))
      }
    }
  }
  return keys
}

export function useMenuVisibility(hiddenMenuKeys: Ref<string[]>) {
  function toggleMenuKey(key: string) {
    const index = hiddenMenuKeys.value.indexOf(key)
    if (index > -1) {
      hiddenMenuKeys.value.splice(index, 1)
    } else {
      hiddenMenuKeys.value.push(key)
    }
  }

  function isSectionAllVisible(section: MenuSection): boolean {
    const keys = getSectionChildrenKeys(section)
    return keys.every((key) => !hiddenMenuKeys.value.includes(key))
  }

  function isSectionSomeVisible(section: MenuSection): boolean {
    const keys = getSectionChildrenKeys(section)
    return keys.some((key) => !hiddenMenuKeys.value.includes(key))
  }

  function toggleSectionAll(section: MenuSection) {
    const childrenKeys = getSectionChildrenKeys(section)
    const allVisible = isSectionAllVisible(section)

    if (allVisible) {
      if (section.key && !hiddenMenuKeys.value.includes(section.key)) {
        hiddenMenuKeys.value.push(section.key)
      }
      for (const key of childrenKeys) {
        if (!hiddenMenuKeys.value.includes(key)) {
          hiddenMenuKeys.value.push(key)
        }
      }
    } else {
      if (section.key) {
        const idx = hiddenMenuKeys.value.indexOf(section.key)
        if (idx > -1) hiddenMenuKeys.value.splice(idx, 1)
      }
      for (const key of childrenKeys) {
        const idx = hiddenMenuKeys.value.indexOf(key)
        if (idx > -1) {
          hiddenMenuKeys.value.splice(idx, 1)
        }
      }
    }
  }

  return {
    toggleMenuKey,
    isSectionAllVisible,
    isSectionSomeVisible,
    toggleSectionAll,
  }
}
