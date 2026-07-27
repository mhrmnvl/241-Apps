import { computed, ref, type Ref } from 'vue'
import type { PositionCategoryRef, PositionListItem } from '../types'

export function usePositionCategoryFilter(positions: Ref<PositionListItem[]>) {
  const kategori = ref('')

  const categoryOptions = computed(() => {
    const map = new Map<string, PositionCategoryRef>()
    for (const p of positions.value) {
      if (p.category) map.set(p.category.id, p.category)
    }
    return [...map.values()]
  })

  const filteredPositions = computed(() => {
    if (!kategori.value) return positions.value
    return positions.value.filter((p) => p.category?.id === kategori.value)
  })

  return { kategori, categoryOptions, filteredPositions }
}
