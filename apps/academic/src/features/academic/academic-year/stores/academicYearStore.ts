import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AcademicYear } from '../types'

export const useAcademicYearStore = defineStore('academicYear', () => {
  const academicYears = ref<AcademicYear[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return {
    academicYears,
    totalItems,
    loading,
    isSaving,
    formError,
  }
})
