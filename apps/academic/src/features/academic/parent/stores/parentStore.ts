import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Parent } from '../types'
import type { Occupation } from '@/features/academic/occupation'

export const useParentStore = defineStore('parent', () => {
  const items = ref<Parent[]>([])
  const totalItems = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  const occupations = ref<Occupation[]>([])
  const searchQuery = ref<string>('')
  const selectedOccupationId = ref<string>('')

  return {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    occupations,
    searchQuery,
    selectedOccupationId,
  }
})
