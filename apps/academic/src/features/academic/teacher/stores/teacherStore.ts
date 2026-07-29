import type { Teacher, PositionListItem } from '../types'
import type { PositionCategory } from '../../position-category/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref<Teacher[]>([])
  const positions = ref<PositionListItem[]>([])
  const positionCategories = ref<PositionCategory[]>([])
  const totalTeachers = ref(0)

  const currentPage = ref(1)
  const pageSize = ref(10)

  const filters = ref({
    keyword: '',
    positionCategoryId: '' as string,
    statusFilter: 'all',
  })

  const loading = ref(false)
  const isSaving = ref(false)
  const isSavingPosition = ref(false)
  const formError = ref<string | null>(null)

  return {
    teachers,
    positions,
    positionCategories,
    totalTeachers,
    currentPage,
    pageSize,
    filters,
    loading,
    isSaving,
    isSavingPosition,
    formError,
  }
})
