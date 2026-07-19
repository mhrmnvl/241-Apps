import { dashboardApi } from '../api/dashboardApi'
import { useDashboardStore } from '../stores/dashboardStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const dashboardService = {
  fetchSummary: async () => {
    const store = useDashboardStore()
    store.loading = true
    try {
      const res = await dashboardApi.getSummary()
      store.summary = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal mengambil ringkasan dashboard.',
        ),
      )
    } finally {
      store.loading = false
    }
  },
}
