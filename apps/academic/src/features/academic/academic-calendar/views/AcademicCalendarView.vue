<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AcademicCalendarGridView from '../components/AcademicCalendarGridView.vue'
import AcademicCalendarSidebar from '../components/AcademicCalendarSidebar.vue'
import { useAcademicCalendarView } from '../composables/useAcademicCalendarView'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import '../styles/calendar.css'
import type { DateClickInfo, EventClickInfo } from '../types'
import { useAcademicSetting } from '@/features/academic/academic-setting'

const router = useRouter()

const {
  events,
  isLoading,
  currentRange,
  fetchEvents,
  canManageCalendar,
  todayEvents,
  upcomingEvents,
} = useAcademicCalendarView()

/**
 * The teaching week, so the grid can shade the days school does not run.
 *
 * Read through the settings feature's own composable rather than duplicated
 * here. A reader without `academic-settings.read` simply gets no shading —
 * the calendar itself is unaffected, and nothing is surfaced as an error on a
 * page that is not about settings.
 */
const { weeklyHolidays, fetch: fetchAcademicSetting } = useAcademicSetting()

function handleDateClick(info: DateClickInfo) {
  if (!canManageCalendar.value) return
  void router.push({
    name: 'academic-calendar-create',
    query: { date: info.dateStr },
  })
}

function handleEventClick(info: EventClickInfo) {
  if (!canManageCalendar.value) return
  const ep = info.event.extendedProps
  void router.push({
    name: 'academic-calendar-edit',
    params: { id: info.event.id },
    state: {
      eventData: {
        id: info.event.id,
        title: info.event.title,
        description: ep.description,
        typeId: ep.type?.id ?? '',
        type: ep.type,
        startDate: ep.startDate!,
        endDate: ep.endDate!,
        academicYearId: ep.academicYearId,
      },
    },
  })
}

onMounted(() => {
  if (currentRange.value.start && currentRange.value.end) {
    void fetchEvents(currentRange.value)
  }
  void fetchAcademicSetting()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Kalender Akademik
          </CardTitle>
        </div>
      </CardHeader>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        <div class="lg:col-span-1">
          <AcademicCalendarSidebar
            :today-events="todayEvents"
            :upcoming-events="upcomingEvents"
            @event-click="handleEventClick"
          />
        </div>

        <div
          class="lg:col-span-3 bg-background rounded-2xl border shadow-sm p-4 md:p-6"
        >
          <AcademicCalendarGridView
            :events="events"
            :is-loading="isLoading"
            :weekly-holidays="weeklyHolidays"
            @date-click="handleDateClick"
            @event-click="handleEventClick"
            @fetch-events="fetchEvents"
          />
        </div>
      </div>
    </Card>
  </div>
</template>
