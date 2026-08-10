import { storeToRefs } from 'pinia'
import { useRaporStore } from '../stores/raporStore'
import { raporService } from '../services/raporService'

export const useRapor = () => {
  const store = useRaporStore()

  const setPage = async (page: number) => {
    store.currentPage = page
    await raporService.fetchRapors()
  }

  const setPageSize = async (size: number) => {
    store.pageSize = size
    store.currentPage = 1
    await raporService.fetchRapors()
  }

  return {
    ...storeToRefs(store),

    fetchFilterOptions: raporService.fetchFilterOptions.bind(raporService),
    fetchRapors: raporService.fetchRapors.bind(raporService),
    generateRapor: raporService.generateRapor.bind(raporService),
    bulkGenerateRapor: raporService.bulkGenerateRapor.bind(raporService),
    updateRapor: raporService.updateRapor.bind(raporService),
    publishRapor: raporService.publishRapor.bind(raporService),
    fetchRaporDetail: raporService.fetchRaporDetail.bind(raporService),
    togglePublish: raporService.togglePublish.bind(raporService),
    fetchScoresForRapor: raporService.fetchScoresForRapor.bind(raporService),
    exportReportCard: raporService.exportReportCard.bind(raporService),
    setPage,
    setPageSize,
  }
}
