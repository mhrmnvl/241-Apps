<script setup lang="ts">
import EventCalendarGridView from '../components/EventCalendarGridView.vue'
import EventCalendarTableView from '../components/EventCalendarTableView.vue'
import EventCalendarDialog from '../components/EventCalendarDialog.vue'
import { useEventCalendar } from '../composables/useEventCalendar'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'

import type {
  DateClickInfo,
  EventClickInfo,
  EventData,
  EventCreatePayload,
} from '../types'
import '../styles/calendar.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-vue-next'
import { useRoleGuard } from '@/features/platform/auth'
import { computed, ref, watch } from 'vue'

const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Kalender Kegiatan' },
]

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
} = useEventCalendar()

const activeTab = ref('calendar')
const { can } = useRoleGuard()
const sheetOpen = ref(false)
const sheetEventData = ref<EventData | null>(null)
const selectedDate = ref('')
const tableViewRef = ref<{ clearSelection: () => void } | null>(null)

const padZero = (num: number) => num.toString().padStart(2, '0')

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${padZero(d.getHours())}:${padZero(d.getMinutes())}`
}

const formatDateStr = (dateStr: string) => {
  const d = new Date(dateStr)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

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
      const startTime = new Date(event.startTime)
      const endTime = new Date(event.endTime)

      const isHappeningNow = now >= startTime && now <= endTime
      const startsToday = startTime >= todayStart && startTime <= todayEnd
      const endsToday = endTime >= todayStart && endTime <= todayEnd

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
        const startTime = new Date(event.startTime)
        return (
          startTime > now && !todayEvents.value.some((e) => e.id === event.id)
        )
      } catch {
        return false
      }
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, 5)
})

function openCreateDialog() {
  sheetEventData.value = null
  selectedDate.value = ''
  sheetOpen.value = true
}

function handleDateClick(info: DateClickInfo) {
  if (!(can('events.update') || can('events.delete'))) return
  sheetEventData.value = null
  selectedDate.value = info.dateStr
  sheetOpen.value = true
}

function handleEventClick(info: EventClickInfo) {
  if (!(can('events.update') || can('events.delete'))) return
  const ep = info.event.extendedProps
  openEditSheet({
    id: info.event.id,
    title: info.event.title,
    description: ep.description,
    audiences: ep.audiences ?? [],
    startTime: ep.startTime!,
    endTime: ep.endTime!,
    classroomIds: ep.classroomIds,
  })
}

function openEditSheet(eventObj: EventData) {
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

const { saveEvent, deleteEvent } = useEventCalendar()

const isSavingEvent = ref(false)

async function handleSaveEvent(payload: EventCreatePayload, id?: string) {
  isSavingEvent.value = true
  try {
    const result = await saveEvent(id ?? null, payload)
    if (result) {
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
    const result = await deleteEvent(id)
    if (result) {
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
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Kalender Kegiatan
            </CardTitle>
          </div>
          <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button
              v-if="can('events.create')"
              class="w-full sm:w-auto"
              @click="openCreateDialog"
            >
              <Plus class="size-4 mr-2" />
              Tambah Agenda
            </Button>
          </div>
        </CardHeader>

        <Tabs
          v-model="activeTab"
          class="w-full"
        >
          <div class="px-6 pt-2 border-b bg-muted/10">
            <TabsList class="h-auto rounded-none bg-transparent p-0">
              <TabsTrigger
                value="calendar"
                class="rounded-b-none border border-transparent border-b-0 px-4 py-2 data-[state=active]:-mb-px data-[state=active]:z-10 data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none"
              >
                Tampilan Kalender
              </TabsTrigger>
              <TabsTrigger
                v-if="can('events.create')"
                value="tabel"
                class="rounded-b-none border border-transparent border-b-0 px-4 py-2 data-[state=active]:-mb-px data-[state=active]:z-10 data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none"
              >
                Manajemen Data
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="calendar"
            class="m-0 border-none outline-none focus-visible:ring-0 w-full"
          >
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
              <div class="lg:col-span-1 space-y-6">
                <Card class="border-none shadow-none bg-primary/5">
                  <CardHeader class="pb-3 px-4">
                    <CardTitle
                      class="text-sm font-semibold text-primary flex items-center gap-2"
                    >
                      <Clock class="size-4" />
                      Kegiatan Hari Ini
                    </CardTitle>
                  </CardHeader>
                  <CardContent class="px-4 pb-4">
                    <div
                      v-if="todayEvents.length > 0"
                      class="space-y-3"
                    >
                      <div
                        v-for="event in todayEvents"
                        :key="event.id"
                        class="bg-background rounded-xl p-3 shadow-sm border cursor-pointer hover:border-primary/50 transition-colors"
                        @click="
                          handleEventClick({
                            event: {
                              id: event.id,
                              title: event.title,
                              extendedProps: event,
                            },
                          })
                        "
                      >
                        <div class="font-medium text-sm mb-1 line-clamp-1">
                          {{ event.title }}
                        </div>
                        <div
                          class="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"
                        >
                          <CalendarIcon class="size-3" />
                          <span
                            >{{ formatTime(event.startTime) }} -
                            {{ formatTime(event.endTime) }}</span
                          >
                        </div>
                      </div>
                    </div>
                    <div
                      v-else
                      class="text-sm text-muted-foreground text-center py-6 bg-background/50 rounded-xl border border-dashed"
                    >
                      Tidak ada kegiatan hari ini
                    </div>
                  </CardContent>
                </Card>

                <Card class="border-none shadow-none bg-muted/30">
                  <CardHeader class="pb-3 px-4">
                    <CardTitle
                      class="text-sm font-semibold flex items-center gap-2"
                    >
                      <CalendarIcon class="size-4" />
                      Kegiatan Mendatang
                    </CardTitle>
                  </CardHeader>
                  <CardContent class="px-4 pb-4">
                    <div
                      v-if="upcomingEvents.length > 0"
                      class="space-y-3"
                    >
                      <div
                        v-for="event in upcomingEvents"
                        :key="event.id"
                        class="bg-background rounded-xl p-3 shadow-sm border cursor-pointer hover:border-primary/50 transition-colors"
                        @click="
                          handleEventClick({
                            event: {
                              id: event.id,
                              title: event.title,
                              extendedProps: event,
                            },
                          })
                        "
                      >
                        <div class="font-medium text-sm mb-1 line-clamp-1">
                          {{ event.title }}
                        </div>
                        <div
                          class="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"
                        >
                          <CalendarIcon class="size-3" />
                          <span>{{ formatDateStr(event.startTime) }}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else
                      class="text-sm text-muted-foreground text-center py-6 bg-background/50 rounded-xl border border-dashed"
                    >
                      Tidak ada kegiatan mendatang
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div
                class="lg:col-span-3 bg-background rounded-2xl border shadow-sm p-4 md:p-6"
              >
                <EventCalendarGridView
                  :events="events"
                  :is-loading="isLoading"
                  @date-click="handleDateClick"
                  @event-click="handleEventClick"
                  @fetch-events="fetchEvents"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="tabel"
            class="m-0 border-none outline-none focus-visible:ring-0 w-full bg-background rounded-b-2xl"
          >
            <EventCalendarTableView
              ref="tableViewRef"
              :table-events="tableEvents"
              :is-loading="tableLoading"
              :is-deleting-bulk="isDeletingBulk"
              :show-actions="can('events.update') || can('events.delete')"
              @update-filters="handleUpdateFilters"
              @delete-bulk="handleDeleteBulk"
              @edit="openEditSheet"
              @deleted="handleSavedOrDeleted"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>

    <EventCalendarDialog
      v-if="can('events.create')"
      :open="sheetOpen"
      :event-data="sheetEventData"
      :selected-date="selectedDate"
      :is-saving="isSavingEvent"
      @update:open="sheetOpen = $event"
      @saved="handleSaveEvent"
      @deleted="handleDeleteEvent"
    />
  </AppLayout>
</template>
