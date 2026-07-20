import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  AdmissionApplicationListItem,
  AdmissionWaveSummary,
} from '../types'

export const useApplicationStore = defineStore('admissionApplication', () => {
  const applications = ref<AdmissionApplicationListItem[]>([])
  const waves = ref<AdmissionWaveSummary[]>([])
  const total = ref(0)
  const loading = ref(false)

  return {
    applications,
    waves,
    total,
    loading,
  }
})
