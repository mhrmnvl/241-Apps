<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AcademicCalendarDetailDialog from '../components/AcademicCalendarDetailDialog.vue'
import AcademicCalendarGridView from '../components/AcademicCalendarGridView.vue'
import AcademicCalendarSidebar from '../components/AcademicCalendarSidebar.vue'
import { useAcademicCalendarView } from '../composables/useAcademicCalendarView'
import { usePreservedScroll } from '../composables/usePreservedScroll'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import '../styles/calendar.css'
import type { CalendarEventData, DateClickInfo, EventClickInfo } from '../types'
import { useAcademicSetting } from '@/features/academic/academic-setting'

const router = useRouter()

const selectedEvent = ref<CalendarEventData | null>(null)
const isDetailOpen = ref(false)

/**
 * Where the page was before the dialog opened.
 *
 * Opening one changes the viewport width — Reka removes the body scrollbar and
 * pads for it — and FullCalendar re-lays the grid at the new width. The page
 * shrinks for a frame and the scroll position is clamped away with it.
 */
const pageRoot = ref<HTMLElement | null>(null)
usePreservedScroll(isDetailOpen, pageRoot)

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
  const ep = info.event.extendedProps
  selectedEvent.value = {
    id: info.event.id,
    title: info.event.title,
    description: ep.description,
    typeId: ep.type?.id ?? '',
    type: ep.type,
    startDate: ep.startDate!,
    endDate: ep.endDate!,
    startTime: ep.startTime,
    endTime: ep.endTime,
    academicYearId: ep.academicYearId,
  }
  isDetailOpen.value = true
}

function handleEditEvent(eventObj: CalendarEventData) {
  void router.push({
    name: 'academic-calendar-edit',
    params: { id: eventObj.id },
    state: {
      eventData: { ...eventObj },
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
  <div
    ref="pageRoot"
    class="p-4 md:p-6 lg:p-8"
  >
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

    <!-- Event Detail / Preview Dialog -->
    <AcademicCalendarDetailDialog
      v-model:open="isDetailOpen"
      :event="selectedEvent"
      :can-manage="canManageCalendar"
      @edit="handleEditEvent"
    />
  </div>
</template>
