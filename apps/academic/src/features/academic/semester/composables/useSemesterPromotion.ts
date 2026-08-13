import { storeToRefs } from 'pinia'
import { semesterService } from '../services/semesterService'
import { useSemesterStore } from '../stores/semesterStore'

export function useSemesterPromotion() {
  const store = useSemesterStore()
  const {
    isPromoting,
    promotionPreview,
    promotionRecommendations,
    excludedGraduatingCount,
    isLoadingRecommendations,
  } = storeToRefs(store)

  return {
    isPromoting,
    promotionPreview,
    promotionRecommendations,
    excludedGraduatingCount,
    isLoadingRecommendations,
    fetchPromotionRecommendation: semesterService.fetchPromotionRecommendation,
    previewPromotion: semesterService.previewPromotion,
    executePromotion: semesterService.executePromotion,
  }
}
