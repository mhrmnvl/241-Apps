import type { Teacher, PositionListItem } from '../types'
import type { PositionCategory } from '../../position-category/types'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref<Teacher[]>([])
  const positions = ref<PositionListItem[]>([])
  const positionCategories = ref<PositionCategory[]>([])
  const totalTeachers = ref(0)

  const currentPage = ref(1)
  const pageSize = ref(10)

  const filters = ref({
    keyword: '',
    positionCategoryId: '',
    statusFilter: 'all',
    categoryFilter: 'all',
    positionFilter: 'all',
  })

  const loading = ref(false)
  const isSaving = ref(false)
  const isSavingPosition = ref(false)
  const formError = ref<string | null>(null)

  const filteredTeachers = computed(() => {
    return teachers.value.filter((t) => {
      const kw = filters.value.keyword.toLowerCase()
      const matchKeyword =
        (!kw ||
          t.user?.profile?.name?.toLowerCase().includes(kw) ||
          t.nip?.toLowerCase().includes(kw)) ??
        false

      const matchStatus =
        filters.value.statusFilter === 'all' ||
        (filters.value.statusFilter === 'active' && t.isActive) ||
        (filters.value.statusFilter === 'inactive' && !t.isActive)

      const matchCategory =
        filters.value.categoryFilter === 'all' ||
        t.teacherPositions?.some(
          (tp) => tp.position?.category?.id === filters.value.categoryFilter,
        )

      const matchPosition =
        filters.value.positionFilter === 'all' ||
        t.teacherPositions?.some(
          (tp) => tp.position?.id === filters.value.positionFilter,
        )

      return matchKeyword && matchStatus && matchCategory && matchPosition
    })
  })

  return {
    teachers,
    positions,
    positionCategories,
    totalTeachers,
    currentPage,
    pageSize,
    filters,
    filteredTeachers,
    loading,
    isSaving,
    isSavingPosition,
    formError,
  }
})
