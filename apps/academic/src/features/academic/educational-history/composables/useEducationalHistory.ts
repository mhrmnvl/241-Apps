import { storeToRefs } from 'pinia'
import { useEducationalHistoryStore } from '../stores/educationalHistoryStore'
import { educationalHistoryService } from '../services/educationalHistoryService'

export function useEducationalHistory() {
  const store = useEducationalHistoryStore()

  const { isSaving } = storeToRefs(store)

  return {
    isSaving,
    saveEducationalHistory: educationalHistoryService.saveEducationalHistory,
    deleteEducationalHistory:
      educationalHistoryService.deleteEducationalHistory,
    getEducationLevels: educationalHistoryService.getEducationLevels,
  }
}
