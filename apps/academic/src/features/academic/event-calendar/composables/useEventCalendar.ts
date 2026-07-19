import { storeToRefs } from 'pinia'
import { eventCalendarService } from '../services/eventCalendarService'
import { useEventCalendarStore } from '../stores/eventCalendarStore'

export function useEventCalendar() {
  const store = useEventCalendarStore()

  const {
    events,
    loading,
    tableEvents,
    tableLoading,
    isDeletingBulk,
    currentRange,
    currentFilters,
  } = storeToRefs(store)

  return {
    events,
    loading,
    tableEvents,
    tableLoading,
    isDeletingBulk,
    currentRange,
    currentFilters,
    fetchEvents: eventCalendarService.fetchEvents.bind(eventCalendarService),
    fetchTableEvents:
      eventCalendarService.fetchTableEvents.bind(eventCalendarService),
    handleUpdateFilters:
      eventCalendarService.handleUpdateFilters.bind(eventCalendarService),
    deleteBulk: eventCalendarService.deleteBulk.bind(eventCalendarService),
    deleteEvent: eventCalendarService.deleteEvent.bind(eventCalendarService),
    saveEvent: eventCalendarService.saveEvent.bind(eventCalendarService),
  }
}
