import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PAGINATION } from '@/shared/constants/pagination'
import type { Achievement } from '../types'

export const useAchievementStore = defineStore('achievement', () => {
  const isSaving = ref(false)

  /** The standalone list; the profile tab holds its own rows locally. */
  const items = ref<Achievement[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(PAGINATION.DEFAULT_PAGE_SIZE)
  const selectedTypeId = ref('')
  const selectedYear = ref('')

  return {
    isSaving,
    items,
    totalItems,
    loading,
    currentPage,
    pageSize,
    selectedTypeId,
    selectedYear,
  }
})
