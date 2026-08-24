import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MyDashboard } from '../types'

export const useMyDashboardStore = defineStore('myDashboard', () => {
  const dashboard = ref<MyDashboard | null>(null)
  const loading = ref(false)
  const loadError = ref<string | null>(null)
  /** True once a fetch has settled, so "no data" can be told from "not asked yet". */
  const loaded = ref(false)

  return { dashboard, loading, loadError, loaded }
})
