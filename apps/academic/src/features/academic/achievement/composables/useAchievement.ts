import { storeToRefs } from 'pinia'
import { useAchievementStore } from '../stores/achievementStore'
import { achievementService } from '../services/achievementService'

export function useAchievement() {
  const store = useAchievementStore()

  const { isSaving } = storeToRefs(store)

  return {
    isSaving,
    saveAchievement: achievementService.saveAchievement,
    deleteAchievement: achievementService.deleteAchievement,
  }
}
