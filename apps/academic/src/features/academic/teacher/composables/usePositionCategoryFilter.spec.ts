import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import type { PositionListItem } from '../types'
import { usePositionCategoryFilter } from './usePositionCategoryFilter'

function makePosition(
  overrides: Partial<PositionListItem> = {},
): PositionListItem {
  return {
    id: 'pos-1',
    name: 'Guru Kelas',
    category: { id: 'cat-1', code: 'ACADEMIC', name: 'Akademik' },
    ...overrides,
  }
}

describe('usePositionCategoryFilter', () => {
  it('derives deduplicated category options from the positions list', () => {
    const positions = ref<PositionListItem[]>([
      makePosition({
        id: 'p1',
        category: { id: 'cat-1', code: 'ACADEMIC', name: 'Akademik' },
      }),
      makePosition({
        id: 'p2',
        category: { id: 'cat-1', code: 'ACADEMIC', name: 'Akademik' },
      }),
      makePosition({
        id: 'p3',
        category: { id: 'cat-2', code: 'ADMIN', name: 'Tata Usaha' },
      }),
    ])

    const { categoryOptions } = usePositionCategoryFilter(positions)

    expect(categoryOptions.value.map((c) => c.id)).toEqual(['cat-1', 'cat-2'])
  })

  it('returns every position when no category filter is selected', () => {
    const positions = ref<PositionListItem[]>([
      makePosition({ id: 'p1' }),
      makePosition({
        id: 'p2',
        category: { id: 'cat-2', code: 'ADMIN', name: 'Tata Usaha' },
      }),
    ])

    const { filteredPositions } = usePositionCategoryFilter(positions)

    expect(filteredPositions.value).toHaveLength(2)
  })

  it('filters positions by the selected category', () => {
    const positions = ref<PositionListItem[]>([
      makePosition({
        id: 'p1',
        category: { id: 'cat-1', code: 'ACADEMIC', name: 'Akademik' },
      }),
      makePosition({
        id: 'p2',
        category: { id: 'cat-2', code: 'ADMIN', name: 'Tata Usaha' },
      }),
    ])

    const { kategori, filteredPositions } = usePositionCategoryFilter(positions)
    kategori.value = 'cat-2'

    expect(filteredPositions.value.map((p) => p.id)).toEqual(['p2'])
  })
})
