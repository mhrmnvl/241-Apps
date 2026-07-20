import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdmissionAcademicYear, AdmissionWaveSummary } from '../types'

export const useWaveStore = defineStore('admissionWave', () => {
  const waves = ref<AdmissionWaveSummary[]>([])
  const academicYears = ref<AdmissionAcademicYear[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return {
    waves,
    academicYears,
    totalItems,
    loading,
    isSaving,
    formError,
  }
})
