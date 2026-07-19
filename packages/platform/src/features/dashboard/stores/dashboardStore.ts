import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DashboardSummary } from '../types'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null)
  const loading = ref(false)

  return { summary, loading }
})
