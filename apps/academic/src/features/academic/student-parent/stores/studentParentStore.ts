import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StudentParent, StudentOption, ParentOption } from '../types'

export const useStudentParentStore = defineStore('student-parent', () => {
  const items = ref<StudentParent[]>([])
  const totalItems = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  const students = ref<StudentOption[]>([])
  const parents = ref<ParentOption[]>([])

  function reset() {
    items.value = []
    totalItems.value = 0
    loading.value = false
    isSaving.value = false
    formError.value = null
  }

  return {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    students,
    parents,
    reset,
  }
})
