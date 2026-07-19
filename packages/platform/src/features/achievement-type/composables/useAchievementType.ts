import { achievementTypeService } from '../services/achievementTypeService'

export function useAchievementType() {
  return {
    getAchievementTypes: achievementTypeService.getAchievementTypes,
  }
}
