import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import { useStatsStore } from '../stores/statsStore'

export const statsService = {
  fetchStats: async (waveId?: string) => {
    const store = useStatsStore()
    store.loading = true
    try {
      const res = await admissionApi.getStats(waveId)
      store.stats = res.data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat statistik PSB.'),
      )
    } finally {
      store.loading = false
    }
  },
}
