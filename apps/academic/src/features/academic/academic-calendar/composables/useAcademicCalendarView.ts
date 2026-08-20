import { computed } from 'vue'
import { useAcademicCalendar } from './useAcademicCalendar'
import { useCalendarEvents } from './useCalendarEvents'
import { useRoleGuard } from '@/features/platform/auth'

export function useAcademicCalendarView() {
  const {
    events,
    loading: isLoading,
    currentRange,
    fetchEvents,
  } = useAcademicCalendar()

  const { todayEvents, upcomingEvents } = useCalendarEvents(events)

  const { can } = useRoleGuard()
  const canManageCalendar = computed(
    () =>
      can('academic-calendars.create') ||
      can('academic-calendars.update') ||
      can('academic-calendars.delete'),
  )

  return {
    events,
    isLoading,
    currentRange,
    fetchEvents,
    canManageCalendar,
    todayEvents,
    upcomingEvents,
  }
}
