import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Grade, GradeQueryParams } from '../types'

export const useGradeStore = defineStore('grade', () => {
  const items = ref<Grade[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)
  const currentFilters = ref<GradeQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  })

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    currentFilters,
  }
})
