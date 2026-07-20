import { storeToRefs } from 'pinia'
import { statsService } from '../services/statsService'
import { useStatsStore } from '../stores/statsStore'

export function useAdmissionStats() {
  const store = useStatsStore()
  const { stats, loading } = storeToRefs(store)

  return {
    stats,
    loading,
    fetchStats: statsService.fetchStats,
  }
}
