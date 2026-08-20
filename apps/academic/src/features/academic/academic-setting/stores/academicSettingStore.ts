import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_WEEKLY_HOLIDAY } from '../constants/weekdays'
import { FALLBACK_PASSING_SCORE } from '../constants/passing-score'

export const useAcademicSettingStore = defineStore('academicSetting', () => {
  const weeklyHolidays = ref<number[]>([DEFAULT_WEEKLY_HOLIDAY])
  const defaultPassingScore = ref<number>(FALLBACK_PASSING_SCORE)
  const loading = ref(false)
  const isSaving = ref(false)
  const loadError = ref<string | null>(null)
  const formError = ref<string | null>(null)

  return {
    weeklyHolidays,
    defaultPassingScore,
    loading,
    isSaving,
    loadError,
    formError,
  }
})
