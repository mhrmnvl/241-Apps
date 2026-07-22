import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Subject, SubjectQueryParams } from '../types'

export const useSubjectStore = defineStore('subject', () => {
  const subjects = ref<Subject[]>([])
  const totalSubjects = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)
  const currentFilters = ref<SubjectQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  })

  return {
    subjects,
    totalSubjects,
    loading,
    isSaving,
    formError,
    currentFilters,
  }
})
