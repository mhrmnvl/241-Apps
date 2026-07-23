import { computed, ref, watch } from 'vue'
import { useAcademicCalendar } from './useAcademicCalendar'
import { useCalendarFormat } from './useCalendarFormat'
import { useCalendarEvents } from './useCalendarEvents'
import { useRoleGuard } from '@/features/platform/auth'
import type {
  CalendarEventData,
  DateClickInfo,
  EventClickInfo,
  CalendarSavePayload,
} from '../types'

export function useAcademicCalendarView() {
  const {
    events,
    loading: isLoading,
    tableEvents,
    tableLoading,
    isDeletingBulk,
    currentRange,
    fetchEvents,
    fetchTableEvents,
    handleUpdateFilters,
    deleteBulk,
    saveCalendar,
    deleteCalendar,
  } = useAcademicCalendar()

  const { formatTime, formatDateStr, formatEventType } = useCalendarFormat()
  const { todayEvents, upcomingEvents } = useCalendarEvents(events)

  const activeTab = ref('calendar')
  const { can } = useRoleGuard()
  const canManageCalendar = computed(
    () =>
      can('academic-calendars.create') ||
      can('academic-calendars.update') ||
      can('academic-calendars.delete'),
  )
  const sheetOpen = ref(false)
  const sheetEventData = ref<CalendarEventData | null>(null)
  const selectedDate = ref('')
  const tableViewRef = ref<{ clearSelection: () => void } | null>(null)
  const isSavingEvent = ref(false)

  function openCreateDialog() {
    sheetEventData.value = null
    selectedDate.value = ''
    sheetOpen.value = true
  }

  function handleDateClick(info: DateClickInfo) {
    if (!can('academic-calendars.create')) return
    sheetEventData.value = null
    selectedDate.value = info.dateStr
    sheetOpen.value = true
  }

  function handleEventClick(info: EventClickInfo) {
    if (!can('academic-calendars.update')) return
    const ep = info.event.extendedProps
    openEditSheet({
      id: info.event.id,
      title: info.event.title,
      description: ep.description,
      typeId: ep.type?.id ?? '',
      type: ep.type,
      startDate: ep.startDate!,
      endDate: ep.endDate!,
      academicYearId: ep.academicYearId,
    })
  }

  function openEditSheet(eventObj: CalendarEventData) {
    sheetEventData.value = eventObj
    selectedDate.value = ''
    sheetOpen.value = true
  }

  async function handleDeleteBulk(ids: string[]) {
    const success = await deleteBulk(ids)
    if (success) {
      if (tableViewRef.value) {
        tableViewRef.value.clearSelection()
      }
      void fetchTableEvents()
      if (currentRange.value.start && currentRange.value.end) {
        void fetchEvents(currentRange.value)
      }
    }
  }

  async function handleSaveEvent(payload: CalendarSavePayload, id?: string) {
    isSavingEvent.value = true
    try {
      const success = await saveCalendar(id ?? null, payload)
      if (success) {
        sheetOpen.value = false
        handleSavedOrDeleted()
      }
    } finally {
      isSavingEvent.value = false
    }
  }

  async function handleDeleteEvent(id: string) {
    isSavingEvent.value = true
    try {
      const success = await deleteCalendar(id)
      if (success) {
        sheetOpen.value = false
        handleSavedOrDeleted()
      }
    } finally {
      isSavingEvent.value = false
    }
  }

  function handleSavedOrDeleted() {
    if (currentRange.value.start && currentRange.value.end) {
      void fetchEvents(currentRange.value)
    }
    if (activeTab.value === 'tabel') {
      void fetchTableEvents()
    }
  }

  watch(activeTab, (val) => {
    if (val === 'tabel' && tableEvents.value.length === 0) {
      void fetchTableEvents()
    }
  })

  return {
    events,
    isLoading,
    tableEvents,
    tableLoading,
    isDeletingBulk,
    currentRange,
    fetchEvents,
    fetchTableEvents,
    handleUpdateFilters,
    deleteBulk,
    activeTab,
    canManageCalendar,
    sheetOpen,
    sheetEventData,
    selectedDate,
    tableViewRef,
    todayEvents,
    upcomingEvents,
    isSavingEvent,
    formatTime,
    formatDateStr,
    formatEventType,
    openCreateDialog,
    handleDateClick,
    handleEventClick,
    openEditSheet,
    handleDeleteBulk,
    handleSaveEvent,
    handleDeleteEvent,
    handleSavedOrDeleted,
  }
}
