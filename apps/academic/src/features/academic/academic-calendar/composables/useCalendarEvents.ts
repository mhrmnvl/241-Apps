import { computed } from 'vue'
import type { Ref } from 'vue'
import type { CalendarEventData } from '../types'

export function useCalendarEvents(events: Ref<CalendarEventData[]>) {
  const todayEvents = computed(() => {
    const now = new Date()
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    )
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    )

    return events.value.filter((event) => {
      try {
        const startDate = new Date(event.startDate)
        const endDate = new Date(event.endDate)

        const isHappeningNow = now >= startDate && now <= endDate
        const startsToday = startDate >= todayStart && startDate <= todayEnd
        const endsToday = endDate >= todayStart && endDate <= todayEnd

        return isHappeningNow || startsToday || endsToday
      } catch {
        return false
      }
    })
  })

  const upcomingEvents = computed(() => {
    const now = new Date()
    return events.value
      .filter((event) => {
        try {
          const startDate = new Date(event.startDate)
          return (
            startDate > now && !todayEvents.value.some((e) => e.id === event.id)
          )
        } catch {
          return false
        }
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )
      .slice(0, 5)
  })

  return {
    todayEvents,
    upcomingEvents,
  }
}
