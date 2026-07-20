import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdmissionStats } from '../types'

export const useStatsStore = defineStore('admissionStats', () => {
  const stats = ref<AdmissionStats | null>(null)
  const loading = ref(false)

  return {
    stats,
    loading,
  }
})
