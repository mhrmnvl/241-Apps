import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  EventData,
  EventFilterPayload,
  EventCalendarRange,
} from '../types'

export const useEventCalendarStore = defineStore('event-calendar', () => {
  const events = ref<EventData[]>([])
  const loading = ref(true)

  const tableEvents = ref<EventData[]>([])
  const tableLoading = ref(false)
  const isDeletingBulk = ref(false)

  const currentFilters = ref<EventFilterPayload>({})
  const currentRange = ref<EventCalendarRange>({
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
