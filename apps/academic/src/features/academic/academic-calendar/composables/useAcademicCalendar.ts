import { storeToRefs } from 'pinia'
import { academicCalendarService } from '../services/academicCalendarService'
import { useAcademicCalendarStore } from '../stores/academicCalendarStore'

export function useAcademicCalendar() {
  const store = useAcademicCalendarStore()

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
    fetchEvents: academicCalendarService.fetchEvents.bind(
      academicCalendarService,
    ),
    fetchTableEvents: academicCalendarService.fetchTableEvents.bind(
      academicCalendarService,
    ),
    handleUpdateFilters: academicCalendarService.handleUpdateFilters.bind(
      academicCalendarService,
    ),
    deleteBulk: academicCalendarService.deleteBulk.bind(
      academicCalendarService,
    ),
    deleteCalendar: academicCalendarService.deleteCalendar.bind(
      academicCalendarService,
    ),
    saveCalendar: academicCalendarService.saveCalendar.bind(
      academicCalendarService,
    ),
  }
}
