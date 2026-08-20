import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_WEEKLY_HOLIDAY } from '../constants/weekdays'

export const useAcademicSettingStore = defineStore('academicSetting', () => {
  const weeklyHolidays = ref<number[]>([DEFAULT_WEEKLY_HOLIDAY])
  const loading = ref(false)
  const isSaving = ref(false)
  const loadError = ref<string | null>(null)
  const formError = ref<string | null>(null)

  return {
    weeklyHolidays,
    loading,
    isSaving,
    loadError,
    formError,
  }
})
