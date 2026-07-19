import { ref } from 'vue'
import { achievementTypeService } from '../services/achievementTypeService'
import type {
  AchievementTypeCreatePayload,
  AchievementTypeUpdatePayload,
} from '../types'

export function useAchievementTypeForm() {
  const isSubmitting = ref(false)

  const createAchievementType = async (
    payload: AchievementTypeCreatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await achievementTypeService.createAchievementType(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updateAchievementType = async (
    id: string,
    payload: AchievementTypeUpdatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await achievementTypeService.updateAchievementType(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createAchievementType,
    updateAchievementType,
  }
}
