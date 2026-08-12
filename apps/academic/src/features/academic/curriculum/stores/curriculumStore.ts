import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AcademicYearRef, Curriculum } from '../types'

export const useCurriculumStore = defineStore('curricula', () => {
  const curricula = ref<Curriculum[]>([])
  const academicYears = ref<AcademicYearRef[]>([])
  const totalCurricula = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return {
    curricula,
    academicYears,
    totalCurricula,
    loading,
    isSaving,
    formError,
  }
})
