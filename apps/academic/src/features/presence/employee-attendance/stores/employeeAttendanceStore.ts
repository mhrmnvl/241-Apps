import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isAnomalousDay } from '../types'
import type {
  DailyPresence,
  DailyPresenceDetail,
  MyPresence,
  PresenceDayStatus,
  PresenceRecap,
} from '../types'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export const useEmployeeAttendanceStore = defineStore(
  'presence-employee-attendance',
  () => {
    const days = ref<DailyPresence[]>([])
    const loading = ref(false)
    const isSaving = ref(false)

    const selectedDate = ref(today())
    const statusFilter = ref<PresenceDayStatus | ''>('')

    const detail = ref<DailyPresenceDetail | null>(null)

    const now = new Date()
    const recapYear = ref(now.getFullYear())
    const recapMonth = ref(now.getMonth() + 1)
    const recap = ref<PresenceRecap | null>(null)

    const mine = ref<MyPresence | null>(null)

    /**
     * Days needing attention: no check-out, or a check-out with no check-in.
     * Surfaced separately because these are the rows TU has to act on, and they
     * are invisible in a list sorted by name.
     */
    const anomalies = computed(() => days.value.filter(isAnomalousDay))

    const correctedCount = computed(
      () => days.value.filter((day) => day.corrected).length,
    )

    return {
      days,
      loading,
      isSaving,
      selectedDate,
      statusFilter,
      detail,
      recapYear,
      recapMonth,
      recap,
      mine,
      anomalies,
      correctedCount,
    }
  },
)
