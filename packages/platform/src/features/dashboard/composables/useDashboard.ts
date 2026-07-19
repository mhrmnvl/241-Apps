import { storeToRefs } from 'pinia'
import { dashboardService } from '../services/dashboardService'
import { useDashboardStore } from '../stores/dashboardStore'

export function useDashboard() {
  const store = useDashboardStore()
  const { summary, loading } = storeToRefs(store)

  return {
    summary,
    loading,
    fetchSummary: dashboardService.fetchSummary,
  }
}
