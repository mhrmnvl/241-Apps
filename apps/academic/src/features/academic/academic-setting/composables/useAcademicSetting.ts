import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { academicSettingService } from '../services/academicSettingService'
import { useAcademicSettingStore } from '../stores/academicSettingStore'

export function useAcademicSetting() {
  const store = useAcademicSettingStore()
  const { weeklyHolidays, loading, isSaving, loadError, formError } =
    storeToRefs(store)

  /**
   * The toggles edit a draft, not the store.
   *
   * Editing the saved value directly would leave the screen claiming a rule
   * the server never accepted the moment a save failed.
   */
  const draft = ref<number[]>([...weeklyHolidays.value])

  watch(weeklyHolidays, (saved) => {
    draft.value = [...saved]
  })

  const isDirty = computed(() => {
    const a = [...draft.value].sort((x, y) => x - y)
    const b = [...weeklyHolidays.value].sort((x, y) => x - y)
    return a.length !== b.length || a.some((day, i) => day !== b[i])
  })

  function toggle(weekday: number) {
    draft.value = draft.value.includes(weekday)
      ? draft.value.filter((day) => day !== weekday)
      : [...draft.value, weekday]
  }

  function reset() {
    draft.value = [...weeklyHolidays.value]
  }

  async function save() {
    await academicSettingService.saveWeeklyHolidays(draft.value)
  }

  return {
    draft,
    weeklyHolidays,
    loading,
    isSaving,
    loadError,
    formError,
    isDirty,
    toggle,
    reset,
    save,
    fetch: academicSettingService.fetchAcademicSetting,
  }
}
