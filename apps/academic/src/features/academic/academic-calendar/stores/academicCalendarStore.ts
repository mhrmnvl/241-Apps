import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CalendarEventData, FilterPayload, CalendarRange } from '../types'

export const useAcademicCalendarStore = defineStore('academic-calendar', () => {
  const events = ref<CalendarEventData[]>([])
  const loading = ref(true)

  const tableEvents = ref<CalendarEventData[]>([])
  const tableLoading = ref(false)
  const isDeletingBulk = ref(false)

  const currentFilters = ref<FilterPayload>({ type: 'ALL' })
  const currentRange = ref<CalendarRange>({
    start: '',
    end: '',
  })

  return {
    events,
    loading,
    tableEvents,
    tableLoading,
    isDeletingBulk,
    currentFilters,
    currentRange,
  }
})
