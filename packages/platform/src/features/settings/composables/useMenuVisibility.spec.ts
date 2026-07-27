import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { Home } from 'lucide-vue-next'
import type { MenuSection } from '@/shared/types/menu.types'
import { useMenuVisibility } from './useMenuVisibility'

function makeSection(overrides: Partial<MenuSection> = {}): MenuSection {
  return {
    key: 'section-a',
    label: 'Section A',
    items: [
      {
        key: 'item-1',
        title: 'Item 1',
        url: '/item-1',
        icon: Home,
        items: [{ key: 'sub-1', title: 'Sub 1', url: '/sub-1' }],
      },
      { key: 'item-2', title: 'Item 2', url: '/item-2', icon: Home },
    ],
    ...overrides,
  }
}

describe('useMenuVisibility', () => {
  it('toggleMenuKey adds then removes a single key', () => {
    const hiddenMenuKeys = ref<string[]>([])
    const { toggleMenuKey } = useMenuVisibility(hiddenMenuKeys)

    toggleMenuKey('item-1')
    expect(hiddenMenuKeys.value).toEqual(['item-1'])

    toggleMenuKey('item-1')
    expect(hiddenMenuKeys.value).toEqual([])
  })

  it('isSectionAllVisible is true when no item or sub-item key is hidden', () => {
    const hiddenMenuKeys = ref<string[]>([])
    const { isSectionAllVisible } = useMenuVisibility(hiddenMenuKeys)

    expect(isSectionAllVisible(makeSection())).toBe(true)
  })

  it('isSectionAllVisible is false when a nested sub-item key is hidden', () => {
    const hiddenMenuKeys = ref<string[]>(['sub-1'])
    const { isSectionAllVisible } = useMenuVisibility(hiddenMenuKeys)

    expect(isSectionAllVisible(makeSection())).toBe(false)
  })

  it('isSectionSomeVisible is true when only part of the section is hidden', () => {
    const hiddenMenuKeys = ref<string[]>(['item-1', 'sub-1'])
    const { isSectionSomeVisible, isSectionAllVisible } =
      useMenuVisibility(hiddenMenuKeys)

    expect(isSectionSomeVisible(makeSection())).toBe(true)
    expect(isSectionAllVisible(makeSection())).toBe(false)
  })

  it('toggleSectionAll hides the section key and every child key when all visible', () => {
    const hiddenMenuKeys = ref<string[]>([])
    const { toggleSectionAll } = useMenuVisibility(hiddenMenuKeys)

    toggleSectionAll(makeSection())

    expect(hiddenMenuKeys.value.sort()).toEqual(
      ['section-a', 'item-1', 'sub-1', 'item-2'].sort(),
    )
  })

  it('toggleSectionAll shows the section key and every child key when some are hidden', () => {
    const hiddenMenuKeys = ref<string[]>([
      'section-a',
      'item-1',
      'sub-1',
      'item-2',
    ])
    const { toggleSectionAll } = useMenuVisibility(hiddenMenuKeys)

    toggleSectionAll(makeSection())

    expect(hiddenMenuKeys.value).toEqual([])
  })

  it('toggleSectionAll never touches hiddenMenuKeys with a section-level key when the section has none', () => {
    const hiddenMenuKeys = ref<string[]>([])
    const { toggleSectionAll } = useMenuVisibility(hiddenMenuKeys)

    toggleSectionAll(makeSection({ key: undefined }))

    expect(hiddenMenuKeys.value.sort()).toEqual(
      ['item-1', 'sub-1', 'item-2'].sort(),
    )
  })
})
