import type { Teacher, PositionListItem } from '../types'
import { isGuru } from '../utils'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref<Teacher[]>([])
  const positions = ref<PositionListItem[]>([])
  const totalTeachers = ref(0)

  const filters = ref({
    keyword: '',
    categoryFilter: 'all',
    statusFilter: 'all',
  })

  const loading = ref(false)
  const isSaving = ref(false)
  const isSavingPosition = ref(false)
  const formError = ref<string | null>(null)

  const filteredTeachers = computed(() => {
    let list = teachers.value

    if (filters.value.categoryFilter !== 'all') {
      const isGuruCategory = filters.value.categoryFilter === 'guru'
      list = list.filter((e) => isGuru(e) === isGuruCategory)
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
    totalTeachers,
    filters,
    loading,
    isSaving,
    isSavingPosition,
    formError,
    filteredTeachers,
  }
})
