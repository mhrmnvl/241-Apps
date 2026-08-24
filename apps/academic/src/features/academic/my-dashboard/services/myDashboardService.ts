import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { myDashboardApi } from '../api/myDashboardApi'
import { useMyDashboardStore } from '../stores/myDashboardStore'

export const myDashboardService = {
  fetchMyDashboard: async () => {
    const store = useMyDashboardStore()
    store.loading = true
    store.loadError = null
    try {
      const res = await myDashboardApi.getMyDashboard()
      store.dashboard = res.data.data ?? null
    } catch (error: unknown) {
      store.loadError = getIndonesianErrorMessage(
        error,
        'Gagal memuat dashboard.',
      )
    } finally {
      store.loading = false
      // Set last and unconditionally: a failed load has still been attempted,
      // and the screen must stop showing a skeleton either way.
      store.loaded = true
    }
  },
}
