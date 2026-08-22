import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SemesterType } from '@/features/academic/semester-type'
import type {
  AcademicYearRef,
  PromotionPreviewResponse,
  PromotionRecommendationItem,
  RolloverSummary,
  Semester,
} from '../types'

export const useSemesterStore = defineStore('semester', () => {
  const semesters = ref<Semester[]>([])
  const academicYears = ref<AcademicYearRef[]>([])
  const semesterTypes = ref<SemesterType[]>([])
  const totalSemesters = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)
  const isRollingOver = ref(false)
  const rolloverSummary = ref<RolloverSummary | null>(null)
  const isPromoting = ref(false)
  const promotionPreview = ref<PromotionPreviewResponse | null>(null)
  /**
   * Separate from `isPromoting`. The preview runs while the confirmation is
   * open and the execution runs when it is accepted; sharing one flag put the
   * spinner on the button that had not been pressed yet.
   */
  const isPreviewing = ref(false)
  const promotionRecommendations = ref<PromotionRecommendationItem[]>([])
  /**
   * Final-year students the run left out. Held so the screen can say so — a
   * promotion that omits the graduating cohort from both its list and its
   * counts is how a year ends with those students still enrolled.
   */
  const excludedGraduatingCount = ref(0)
  const isLoadingRecommendations = ref(false)

  return {
    semesters,
    academicYears,
    semesterTypes,
    totalSemesters,
    loading,
    isSaving,
    formError,
    isRollingOver,
    rolloverSummary,
    isPromoting,
    promotionPreview,
    isPreviewing,
    promotionRecommendations,
    excludedGraduatingCount,
    isLoadingRecommendations,
  }
})
