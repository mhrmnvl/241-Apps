import { ref, computed, readonly } from 'vue'
import {
  useScheduleStore,
  scheduleService,
  DAYS,
} from '@/features/academic/schedule'
import { eventCalendarApi } from '@/features/academic/event-calendar'
import { announcementApi } from '@/features/academic/announcement'
import { storeToRefs } from 'pinia'
import type { EventData } from '@/features/academic/event-calendar'
import type { Announcement } from '@/features/academic/announcement'

const DAY_MAP: Record<string, string> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

export function useAcademicInfo() {
  const store = useScheduleStore()
  const { lessons, timeSlots, isLoadingSchedule } = storeToRefs(store)

  const upcomingEvents = ref<EventData[]>([])
  const recentAnnouncements = ref<Announcement[]>([])
  const isLoadingEvents = ref(false)
  const isLoadingAnnouncements = ref(false)

  const todayDayName = DAY_MAP[new Date().getDay()]

  const todayLabel = computed(() => {
    const day = DAYS.find((d) => d.value === todayDayName)
    return day?.label ?? ''
  })

  const todayLessons = computed(() => {
    const sorted = [...timeSlots.value].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    )
    return sorted
      .filter((ts) => ts.isLesson)
      .map((ts) => {
        const lesson = lessons.value.find(
          (l) => l.timeSlotId === ts.id && l.day === todayDayName,
        )
        return { timeSlot: ts, lesson: lesson ?? null }
      })
      .filter((row) => row.lesson !== null)
  })

  /**
   * The caller's own schedule, which the server resolves from their records.
   *
   * This read `user.student.classroomId` and returned at the next line, every
   * time: nothing has ever populated that field. Today's schedule on this
   * screen has therefore never appeared, and it failed silently, which is why
   * it lasted.
   */
  async function fetchTodaySchedule() {
    await scheduleService.fetchMySchedule()
  }

  async function fetchUpcomingEvents() {
    isLoadingEvents.value = true
    try {
      const now = new Date()
      const end = new Date(now)
      end.setDate(end.getDate() + 30)

      const res = await eventCalendarApi.getEvents({ limit: 5 })
      const all = res.data?.data ?? []
      upcomingEvents.value = all
        .filter((e) => new Date(e.startTime) >= now)
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        )
        .slice(0, 5)
    } catch {
      // silent — tidak blocker
    } finally {
      isLoadingEvents.value = false
    }
  }

  async function fetchAnnouncements() {
    isLoadingAnnouncements.value = true
    try {
      const res = await announcementApi.getAnnouncements({ limit: 5 })
      recentAnnouncements.value = res.data?.data ?? []
    } catch {
      // silent
    } finally {
      isLoadingAnnouncements.value = false
    }
  }

  async function init() {
    await Promise.all([
      fetchTodaySchedule(),
      fetchUpcomingEvents(),
      fetchAnnouncements(),
    ])
  }

  return {
    todayLabel,
    todayLessons,
    upcomingEvents: readonly(upcomingEvents),
    recentAnnouncements: readonly(recentAnnouncements),
    isLoadingSchedule,
    isLoadingEvents: readonly(isLoadingEvents),
    isLoadingAnnouncements: readonly(isLoadingAnnouncements),
    init,
  }
}
