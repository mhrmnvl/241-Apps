import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AcademicYearRef, Curricula } from '../types'

export const useCurriculaStore = defineStore('curricula', () => {
  const curricula = ref<Curricula[]>([])
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
