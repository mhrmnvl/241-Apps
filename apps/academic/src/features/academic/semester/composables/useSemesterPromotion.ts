import { storeToRefs } from 'pinia'
import { semesterService } from '../services/semesterService'
import { useSemesterStore } from '../stores/semesterStore'

export function useSemesterPromotion() {
  const store = useSemesterStore()
  const {
    isPromoting,
    promotionPreview,
    isPreviewing,
    promotionRecommendations,
    excludedGraduatingCount,
    isLoadingRecommendations,
  } = storeToRefs(store)

  return {
    isPromoting,
    promotionPreview,
    isPreviewing,
    promotionRecommendations,
    excludedGraduatingCount,
    isLoadingRecommendations,
    fetchPromotionRecommendation: semesterService.fetchPromotionRecommendation,
    previewPromotion: semesterService.previewPromotion,
    executePromotion: semesterService.executePromotion,
  }
}
