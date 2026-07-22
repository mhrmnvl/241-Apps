import type { Teacher, PositionListItem } from '../types'
import type { PositionCategory } from '../../position-category/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref<Teacher[]>([])
  const positions = ref<PositionListItem[]>([])
  const positionCategories = ref<PositionCategory[]>([])
  const totalTeachers = ref(0)

  const filters = ref({
    keyword: '',
    categoryFilter: 'all',
    positionFilter: 'all',
    statusFilter: 'all',
  })

  const loading = ref(false)
  const isSaving = ref(false)
  const isSavingPosition = ref(false)
  const formError = ref<string | null>(null)

  const filteredTeachers = computed(() => {
    let list = teachers.value

    if (filters.value.categoryFilter !== 'all') {
      list = list.filter((e) => {
        const primary = e.teacherPositions?.find((ep) => ep.isPrimary)
        return primary?.position?.category?.id === filters.value.categoryFilter
      })
    }

    if (filters.value.positionFilter !== 'all') {
      list = list.filter((e) => {
        const primary = e.teacherPositions?.find((ep) => ep.isPrimary)
        return primary?.position?.id === filters.value.positionFilter
      })
    }

    if (filters.value.statusFilter !== 'all') {
      const isActive = filters.value.statusFilter === 'active'
      list = list.filter((e) => e.user.isActive === isActive)
    }

    return list
  })

  return {
    teachers,
    positions,
    positionCategories,
    totalTeachers,
    filters,
    loading,
    isSaving,
    isSavingPosition,
    formError,
    filteredTeachers,
  }
})
