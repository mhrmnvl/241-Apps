import { storeToRefs } from 'pinia'
import { semesterService } from '../services/semesterService'
import { useSemesterStore } from '../stores/semesterStore'

export function useSemesterPromotion() {
  const store = useSemesterStore()
  const {
    isPromoting,
    promotionPreview,
    promotionRecommendations,
    isLoadingRecommendations,
  } = storeToRefs(store)

  return {
    isPromoting,
    promotionPreview,
    promotionRecommendations,
    isLoadingRecommendations,
    fetchPromotionRecommendation: semesterService.fetchPromotionRecommendation,
    previewPromotion: semesterService.previewPromotion,
    executePromotion: semesterService.executePromotion,
  }
}
