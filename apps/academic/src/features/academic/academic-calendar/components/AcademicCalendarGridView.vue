<script setup lang="ts">
import type {
  CalendarRange,
  DateClickInfo,
  EventClickInfo,
  BaseCalendarEvent,
  MappedCalendarEvent,
} from '../types'
import '../styles/academic-calendar.css'
import CalendarToolbar from './CalendarToolbar.vue'
import type {
  DatesSetArg,
  DayCellContentArg,
  DayHeaderContentArg,
  EventClickArg,
} from '@fullcalendar/core'
import idLocale from '@fullcalendar/core/locales/id'
import dayGridPlugin from '@fullcalendar/daygrid'
import type { DateClickArg } from '@fullcalendar/interaction'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/vue3'
import { computed, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const props = defineProps<{
  events?: BaseCalendarEvent[]
  isLoading?: boolean
  /**
   * Weekdays school does not run, 0 (Sunday) to 6 (Saturday), from Pengaturan
   * Akademik. Applied when a cell is rendered — no entry is stored for any of
   * these days, and changing the rule redraws the whole calendar at once.
   */
  weeklyHolidays?: number[]
}>()
const emit = defineEmits<{
  'date-click': [info: DateClickInfo]
  'event-click': [info: EventClickInfo]
  'fetch-events': [range: CalendarRange]
}>()

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const currentMonth = ref<string>(new Date().getMonth().toString())
const currentYear = ref<string>(new Date().getFullYear().toString())
const isMobile = useMediaQuery('(max-width: 640px)')

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const currentYearNum = new Date().getFullYear()
const years = Array.from({ length: 15 }, (_, i) =>
  (currentYearNum - 5 + i).toString(),
)

const getLocalDateString = (dateStr: string) => {
  if (!dateStr) return dateStr
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const colorPalette = [
  '#2563eb',
  '#16a34a',
  '#ea580c',
  '#06b6d4',
  '#db2777',
  '#0891b2',
  '#ca8a04',
  '#e11d48',
  '#4f46e5',
  '#0d9488',
]

const getColorForEvent = (id?: string) => {
  if (!id) return colorPalette[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colorPalette.length
  return colorPalette[index]
}

const isHolidayWeekday = (date: Date) =>
  (props.weeklyHolidays ?? []).includes(date.getDay())

const calendarEvents = computed(() => {
  const events: MappedCalendarEvent[] = (props.events ?? []).map((e) => {
    const startStr = getLocalDateString(e.startDate)
    let endStr = getLocalDateString(e.endDate)

    if (endStr) {
      const d = new Date(e.endDate)
      d.setDate(d.getDate() + 1)
      const pad = (n: number) => n.toString().padStart(2, '0')
      endStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }

    return {
      ...e,
      start: startStr,
      end: endStr,
      allDay: true,
      display: 'block',
      backgroundColor: getColorForEvent(e.id),
      borderColor: 'transparent',
      textColor: '#ffffff',
      classNames: ['fc-cal-custom'],
    }
  })

  return events
})

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  headerToolbar: false as const,
  dayHeaderFormat: {
    weekday: isMobile.value ? ('short' as const) : ('long' as const),
  },
  events: calendarEvents.value,
  height: 'auto',
  dayCellClassNames: (arg: DayCellContentArg) =>
    isHolidayWeekday(arg.date) ? ['fc-day-holiday'] : [],
  dayHeaderClassNames: (arg: DayHeaderContentArg) =>
    isHolidayWeekday(arg.date) ? ['fc-day-holiday'] : [],
  selectable: true,
  dateClick: (info: DateClickArg) => {
    emit('date-click', { dateStr: info.dateStr })
  },
  eventClick: (info: EventClickArg) => {
    emit('event-click', {
      event: {
        id: info.event.id,
        title: info.event.title,
        extendedProps: info.event.extendedProps,
      },
    })
  },
  datesSet: (info: DatesSetArg) => {
    const currentDate = info.view.calendar.getDate()
    currentMonth.value = currentDate.getMonth().toString()
    currentYear.value = currentDate.getFullYear().toString()

    emit('fetch-events', { start: info.startStr, end: info.endStr })
  },
}))

const handlePrev = () => {
  calendarRef.value?.getApi().prev()
}

const handleNext = () => {
  calendarRef.value?.getApi().next()
}

const handleToday = () => {
  calendarRef.value?.getApi().today()
}

const handleMonthChange = (val: string) => {
  if (!val) return
  currentMonth.value = val
  const api = calendarRef.value?.getApi()
  if (api) {
    api.gotoDate(new Date(Number(currentYear.value), Number(val), 1))
  }
}

const handleYearChange = (val: string) => {
  if (!val) return
  currentYear.value = val
  const api = calendarRef.value?.getApi()
  if (api) {
    api.gotoDate(new Date(Number(val), Number(currentMonth.value), 1))
  }
}
</script>

<template>
  <div
    class="calendar-override w-full relative min-h-[500px] p-3 sm:p-6 bg-background rounded-b-2xl"
  >
    <CalendarToolbar
      :current-month="currentMonth"
      :current-year="currentYear"
      :months="months"
      :years="years"
      @prev="handlePrev"
      @next="handleNext"
      @today="handleToday"
      @month-change="handleMonthChange"
      @year-change="handleYearChange"
    />

    <div
      v-if="isLoading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg"
    >
      <div class="flex items-center gap-2 text-primary">
        <svg
          class="animate-spin h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="font-medium">Memuat kalender...</span>
      </div>
    </div>

    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
    />
  </div>
</template>
