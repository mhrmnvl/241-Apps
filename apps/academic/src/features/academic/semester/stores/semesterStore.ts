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
  const promotionRecommendations = ref<PromotionRecommendationItem[]>([])
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
    promotionRecommendations,
    isLoadingRecommendations,
  }
})
