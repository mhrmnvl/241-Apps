import { storeToRefs } from 'pinia'
import { myDashboardService } from '../services/myDashboardService'
import { useMyDashboardStore } from '../stores/myDashboardStore'

export function useMyDashboard() {
  const store = useMyDashboardStore()
  const { dashboard, loading, loadError, loaded } = storeToRefs(store)

  return {
    dashboard,
    loading,
    loadError,
    loaded,
    fetchMyDashboard: myDashboardService.fetchMyDashboard,
  }
}
